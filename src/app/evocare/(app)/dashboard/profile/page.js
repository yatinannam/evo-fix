"use client";

import { useState, useEffect, useRef } from "react";
import { User, Heart, Activity, Pill, ShieldCheck, Camera, Save, Loader2, Trash2 } from "lucide-react";
import { getCurrentUser, updateAdvancedProfile, uploadAvatar, deleteAvatar } from "@/lib/api";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [localAvatar, setLocalAvatar] = useState(null);
  
  // Custom Popups State
  const [saveModal, setSaveModal] = useState({ visible: false, type: "success", message: "" });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [pendingNav, setPendingNav] = useState(null);
  
  const fileInputRef = useRef(null);

  const isDirty = originalProfile && JSON.stringify(profile) !== JSON.stringify(originalProfile);

  useEffect(() => {
    async function load() {
      try {
        const u = await getCurrentUser();
        const loadedProfile = {
          ...u,
          date_of_birth: u.date_of_birth || "",
          pronouns: u.pronouns || "",
          height: u.height || "",
          weight: u.weight || "",
          past_medical_history: u.past_medical_history || "",
          chronic_conditions: u.chronic_conditions || "",
          family_history: u.family_history || "",
          immunizations: u.immunizations || {},
          smoking_status: u.smoking_status || "",
          alcohol_consumption: u.alcohol_consumption || "",
          dietary_preference: u.dietary_preference || "",
          activity_level: u.activity_level || "",
          occupation: u.occupation || "",
          occupation: u.occupation || "",
          known_allergies: u.known_allergies || "",
          current_medications: u.current_medications || "",
          supplements_otc: u.supplements_otc || "",
          emergency_contact_name: u.emergency_contact_name || "",
          emergency_contact_relation: u.emergency_contact_relation || "",
          emergency_contact_phone: u.emergency_contact_phone || "",
          pcp_name: u.pcp_name || "",
          pcp_clinic: u.pcp_clinic || "",
          insurance_provider: u.insurance_provider || "",
          insurance_policy: u.insurance_policy || "",
          insurance_group: u.insurance_group || ""
        };
        setProfile(loadedProfile);
        setOriginalProfile(loadedProfile);
      } catch (e) {
        console.error("Failed to load profile:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        full_name: profile.full_name,
        blood_group: profile.blood_group,
        date_of_birth: profile.date_of_birth || null,
        age: profile.age ? parseInt(profile.age, 10) : null,
        gender: profile.gender,
        pronouns: profile.pronouns,
        height: profile.height,
        weight: profile.weight,
        past_medical_history: profile.past_medical_history,
        chronic_conditions: profile.chronic_conditions,
        family_history: profile.family_history,
        immunizations: profile.immunizations,
        smoking_status: profile.smoking_status,
        alcohol_consumption: profile.alcohol_consumption,
        dietary_preference: profile.dietary_preference,
        activity_level: profile.activity_level,
        occupation: profile.occupation,
        known_allergies: profile.known_allergies,
        current_medications: profile.current_medications,
        supplements_otc: profile.supplements_otc,
        emergency_contact_name: profile.emergency_contact_name,
        emergency_contact_relation: profile.emergency_contact_relation,
        emergency_contact_phone: profile.emergency_contact_phone,
        pcp_name: profile.pcp_name,
        pcp_clinic: profile.pcp_clinic,
        insurance_provider: profile.insurance_provider,
        insurance_policy: profile.insurance_policy,
        insurance_group: profile.insurance_group,
      };
      await updateAdvancedProfile(payload);
      setOriginalProfile(profile);
      setSaveModal({ visible: true, type: "success", message: "Profile saved successfully!" });
      setTimeout(() => setSaveModal({ visible: false, type: "success", message: "" }), 3000);
      return true;
    } catch (e) {
      console.error(e);
      setSaveModal({ visible: true, type: "error", message: "Failed to save profile. Please try again." });
      setTimeout(() => setSaveModal({ visible: false, type: "error", message: "" }), 3000);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNavigate = async () => {
    const success = await handleSave();
    if (success) {
      confirmNavigation();
    }
  };

  // Intercept navigation if dirty
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handleClick = (e) => {
      const target = e.target.closest('a');
      if (target && target.href && !target.href.includes(window.location.pathname)) {
        e.preventDefault();
        e.stopPropagation();
        setPendingNav(target.href);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, true); // Capture phase

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
    };
  }, [isDirty]);

  const confirmNavigation = () => {
    if (pendingNav) {
      window.location.href = pendingNav;
    }
  };

  const cancelNavigation = () => {
    setPendingNav(null);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const previewUrl = URL.createObjectURL(file);
      setLocalAvatar(previewUrl);
      setUploadingAvatar(true);
      const url = await uploadAvatar(file);
      setProfile(p => ({ ...p, avatar_url: url }));
    } catch (err) {
      console.error(err);
      alert("Failed to upload avatar");
      setLocalAvatar(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="dash-loading" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", padding: "40px" }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const tabs = [
    { id: "personal", label: "Personal Details", icon: User },
    { id: "medical", label: "Medical History", icon: Heart },
    { id: "lifestyle", label: "Lifestyle & Habits", icon: Activity },
    { id: "meds", label: "Meds & Allergies", icon: Pill },
    { id: "contacts", label: "Contacts & Insurance", icon: ShieldCheck },
  ];

  return (
    <div className="profile-layout" style={{ position: 'relative' }}>
      {/* Save Success / Error Modal */}
      {saveModal.visible && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          backgroundColor: 'white', padding: '24px 40px', borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 999999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
          border: `2px solid ${saveModal.type === 'success' ? '#0066FF' : '#EF4444'}`
        }}>
          {saveModal.type === 'success' ? <ShieldCheck color="#0066FF" size={48} /> : <Loader2 color="#EF4444" size={48} />}
          <h3 style={{ margin: 0, color: '#000', fontSize: '20px', fontWeight: 'bold' }}>{saveModal.message}</h3>
        </div>
      )}

      {/* Unsaved Changes Warning Modal */}
      {pendingNav && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 999999,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '40px', borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxWidth: '480px', width: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#111827', fontSize: '24px', fontWeight: '800', textAlign: 'center' }}>Unsaved Changes</h3>
            <p style={{ color: '#4B5563', marginBottom: '32px', textAlign: 'center', fontSize: '15px', lineHeight: '1.6' }}>
              You have unsaved changes in your profile. Are you sure you want to discard them and leave this page?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', width: '100%' }}>
              <button 
                onClick={confirmNavigation}
                disabled={saving}
                style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#0066FF', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '15px', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(0, 102, 255, 0.3)' }}
              >
                Discard
              </button>
              <button 
                onClick={cancelNavigation}
                style={{ padding: '12px 24px', borderRadius: '12px', border: '2px solid #0066FF', background: 'white', color: '#0066FF', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <aside className="profile-sidebar">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper" onClick={() => !profile?.avatar_url && !localAvatar && fileInputRef.current?.click()}>
            {uploadingAvatar ? (
              <div className="avatar-placeholder uploading"><Loader2 className="animate-spin" /></div>
            ) : (localAvatar || profile?.avatar_url) ? (
              <>
                <img 
                  src={localAvatar ? localAvatar : `${profile.avatar_url}?t=${new Date(profile?.updated_at || Date.now()).getTime()}`} 
                  alt="Avatar" 
                  className="avatar-img" 
                />
                <div 
                  className="avatar-overlay delete-overlay"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      setUploadingAvatar(true);
                      await deleteAvatar();
                      setProfile(p => ({ ...p, avatar_url: null }));
                      setLocalAvatar(null);
                    } catch (err) {
                      console.error(err);
                      alert("Failed to delete avatar");
                    } finally {
                      setUploadingAvatar(false);
                    }
                  }}
                  style={{ background: 'rgba(239, 68, 68, 0.9)' }}
                >
                  <Trash2 size={18} />
                </div>
              </>
            ) : (
              <>
                <div className="avatar-placeholder">{(profile?.firstName?.charAt(0) || profile?.full_name?.charAt(0) || profile?.name?.charAt(0) || "U").toUpperCase()}</div>
                <div className="avatar-overlay">
                  <Camera size={18} />
                </div>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              onChange={handleAvatarUpload}
            />
          </div>
          <h2 className="profile-name">{profile?.full_name || profile?.name || "User"}</h2>
          <span className="profile-badge">LIFE MEMBER</span>
        </div>

        <nav className="profile-nav">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`profile-nav-item ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              <t.icon size={18} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* RIGHT CONTENT */}
      <div className="profile-content glass-card">
        <div className="profile-content-header">
          <div className="profile-content-title">
            {(() => {
              const active = tabs.find(t => t.id === activeTab);
              const Icon = active.icon;
              return (
                <>
                  <Icon size={24} className="title-icon" />
                  <h2>{active.label}</h2>
                </>
              );
            })()}
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            style={{ 
              position: 'absolute', 
              top: '40px', 
              right: '40px', 
              zIndex: 99999, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 20px', 
              backgroundColor: '#0066FF', 
              color: '#FFFFFF', 
              borderRadius: '99px', 
              fontWeight: 'bold', 
              border: 'none', 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 102, 255, 0.3)'
            }}
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>

        <div className="profile-content-body">
          {activeTab === "personal" && <PersonalDetailsTab profile={profile} setProfile={setProfile} />}
          {activeTab === "medical" && <MedicalHistoryTab profile={profile} setProfile={setProfile} />}
          {activeTab === "lifestyle" && <LifestyleTab profile={profile} setProfile={setProfile} />}
          {activeTab === "meds" && <MedsAllergiesTab profile={profile} setProfile={setProfile} />}
          {activeTab === "contacts" && <ContactsInsuranceTab profile={profile} setProfile={setProfile} />}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// TAB COMPONENTS
// -----------------------------------------------------------------------------

function PersonalDetailsTab({ profile, setProfile }) {
  const handleChange = (field, value) => setProfile(p => ({ ...p, [field]: value }));

  return (
    <div className="profile-section">
      <div className="profile-grid">
        <div className="input-group">
          <label>FULL NAME</label>
          <input 
            type="text" 
            pattern="[A-Za-z\s]+"
            title="Only letters and spaces are allowed"
            value={profile.full_name || ""} 
            onChange={(e) => {
              const val = e.target.value.replace(/[^A-Za-z\s]/g, "");
              handleChange("full_name", val);
            }} 
          />
        </div>
        <div className="input-group">
          <label>BLOOD TYPE</label>
          <select 
            value={profile.blood_group || ""} 
            onChange={(e) => handleChange("blood_group", e.target.value)}
          >
            <option value="">Select</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>
        <div className="input-group">
          <label>DATE OF BIRTH</label>
          <input 
            type="date" 
            value={profile.date_of_birth || ""} 
            onChange={(e) => handleChange("date_of_birth", e.target.value)} 
          />
        </div>
        <div className="input-group">
          <label>AGE</label>
          <input 
            type="number" 
            value={profile.age || ""} 
            onChange={(e) => handleChange("age", e.target.value)} 
          />
        </div>
        <div className="input-group">
          <label>GENDER IDENTITY</label>
          <select 
            value={["", "Male", "Female", "Non-binary", "Prefer not to say"].includes(profile.gender) ? (profile.gender || "") : "Other"} 
            onChange={(e) => handleChange("gender", e.target.value === "Other" ? "Other (Specify)" : e.target.value)}
          >
            <option value="">Select Gender Identity</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
            <option value="Other">Other</option>
          </select>
          {!["", "Male", "Female", "Non-binary", "Prefer not to say"].includes(profile.gender) && profile.gender !== undefined && (
            <input 
              type="text" 
              placeholder="Specify gender identity" 
              value={profile.gender.replace(/^Other \(Specify\)$/, "")} 
              onChange={(e) => handleChange("gender", e.target.value)} 
              style={{ marginTop: '8px' }}
            />
          )}
        </div>
        <div className="input-group">
          <label>PRONOUNS</label>
          <select 
            value={["", "He/Him", "She/Her", "They/Them"].includes(profile.pronouns) ? (profile.pronouns || "") : "Other"} 
            onChange={(e) => handleChange("pronouns", e.target.value === "Other" ? "Other (Specify)" : e.target.value)}
          >
            <option value="">Select Pronouns</option>
            <option value="He/Him">He/Him</option>
            <option value="She/Her">She/Her</option>
            <option value="They/Them">They/Them</option>
            <option value="Other">Other</option>
          </select>
          {!["", "He/Him", "She/Her", "They/Them"].includes(profile.pronouns) && profile.pronouns !== undefined && (
            <input 
              type="text" 
              placeholder="Specify pronouns" 
              value={profile.pronouns.replace(/^Other \(Specify\)$/, "")} 
              onChange={(e) => handleChange("pronouns", e.target.value)} 
              style={{ marginTop: '8px' }}
            />
          )}
        </div>
        <div className="input-group">
          <label>HEIGHT (CM)</label>
          <input 
            type="number" 
            placeholder="e.g. 175" 
            value={profile.height || ""} 
            onChange={(e) => handleChange("height", e.target.value)} 
            min="0"
          />
        </div>
        <div className="input-group">
          <label>WEIGHT (KG)</label>
          <input 
            type="number" 
            placeholder="e.g. 70" 
            value={profile.weight || ""} 
            onChange={(e) => handleChange("weight", e.target.value)} 
            min="0"
          />
        </div>
      </div>
    </div>
  );
}

function MedicalHistoryTab({ profile, setProfile }) {
  const handleChange = (field, value) => setProfile(p => ({ ...p, [field]: value }));
  const handleImmune = (key, val) => setProfile(p => ({ ...p, immunizations: { ...(p.immunizations || {}), [key]: val } }));
  const getImmune = (key) => profile.immunizations?.[key] || "";

  return (
    <div className="profile-section flex-col">
      <div className="input-group full-width">
        <label>PAST MEDICAL HISTORY</label>
        <textarea 
          placeholder="List past surgeries, hospitalizations, or major illnesses..." 
          value={profile.past_medical_history || ""} 
          onChange={(e) => handleChange("past_medical_history", e.target.value)}
        />
      </div>
      <div className="input-group full-width">
        <label>CHRONIC CONDITIONS</label>
        <textarea 
          placeholder="e.g. Diabetes Type 2, Hypertension..." 
          value={profile.chronic_conditions || ""} 
          onChange={(e) => handleChange("chronic_conditions", e.target.value)}
        />
      </div>
      <div className="input-group full-width">
        <label>FAMILY HISTORY</label>
        <textarea 
          placeholder="Conditions in immediate family (e.g. Father: Heart Disease)" 
          value={profile.family_history || ""} 
          onChange={(e) => handleChange("family_history", e.target.value)}
        />
      </div>

      <div className="profile-divider"></div>
      <h3 className="profile-subheading">Immunizations</h3>
      
      <div className="profile-grid">
        <div className="input-group">
          <label>LAST FLU SHOT</label>
          <input type="text" placeholder="MM-YYYY" value={getImmune("flu")} onChange={(e) => handleImmune("flu", e.target.value)} />
        </div>
        <div className="input-group">
          <label>LAST TETANUS (TDAP)</label>
          <input type="text" placeholder="MM-YYYY" value={getImmune("tetanus")} onChange={(e) => handleImmune("tetanus", e.target.value)} />
        </div>
        <div className="input-group">
          <label>COVID-19 VACCINATION</label>
          <input type="text" placeholder="MM-YYYY" value={getImmune("covid")} onChange={(e) => handleImmune("covid", e.target.value)} />
        </div>
        <div className="input-group">
          <label>HEPATITIS B SERIES</label>
          <select value={getImmune("hepB")} onChange={(e) => handleImmune("hepB", e.target.value)}>
            <option value="">Completed?</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
        <div className="input-group">
          <label>MMR (MEASLES, MUMPS, RUBELLA)</label>
          <select value={getImmune("mmr")} onChange={(e) => handleImmune("mmr", e.target.value)}>
            <option value="">Completed?</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
        <div className="input-group">
          <label>VARICELLA (CHICKENPOX)</label>
          <select value={getImmune("varicella")} onChange={(e) => handleImmune("varicella", e.target.value)}>
            <option value="">Completed?</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function ContactsInsuranceTab({ profile, setProfile }) {
  const handleChange = (field, value) => setProfile(p => ({ ...p, [field]: value }));

  return (
    <div className="profile-section flex-col">
      <h3 className="profile-subheading">Emergency Contact</h3>
      <div className="profile-grid">
        <div className="input-group">
          <label>NAME</label>
          <input 
            type="text" 
            value={profile.emergency_contact_name || ""} 
            onChange={(e) => handleChange("emergency_contact_name", e.target.value)} 
          />
        </div>
        <div className="input-group">
          <label>RELATIONSHIP</label>
          <input 
            type="text" 
            value={profile.emergency_contact_relation || ""} 
            onChange={(e) => handleChange("emergency_contact_relation", e.target.value)} 
          />
        </div>
        <div className="input-group">
          <label>PHONE NUMBER</label>
          <input 
            type="text" 
            value={profile.emergency_contact_phone || ""} 
            onChange={(e) => handleChange("emergency_contact_phone", e.target.value)} 
          />
        </div>
      </div>

      <div className="profile-divider"></div>
      <h3 className="profile-subheading">Primary Care Physician</h3>
      <div className="profile-grid">
        <div className="input-group">
          <label>DR. NAME</label>
          <input 
            type="text" 
            value={profile.pcp_name || ""} 
            onChange={(e) => handleChange("pcp_name", e.target.value)} 
          />
        </div>
        <div className="input-group">
          <label>CLINIC / HOSPITAL</label>
          <input 
            type="text" 
            value={profile.pcp_clinic || ""} 
            onChange={(e) => handleChange("pcp_clinic", e.target.value)} 
          />
        </div>
      </div>

      <div className="profile-divider"></div>
      <h3 className="profile-subheading">Insurance Details</h3>
      <div className="profile-grid">
        <div className="input-group">
          <label>PROVIDER</label>
          <input 
            type="text" 
            value={profile.insurance_provider || ""} 
            onChange={(e) => handleChange("insurance_provider", e.target.value)} 
          />
        </div>
        <div className="input-group">
          <label>POLICY NUMBER</label>
          <input 
            type="text" 
            value={profile.insurance_policy || ""} 
            onChange={(e) => handleChange("insurance_policy", e.target.value)} 
          />
        </div>
        <div className="input-group">
          <label>GROUP ID</label>
          <input 
            type="text" 
            value={profile.insurance_group || ""} 
            onChange={(e) => handleChange("insurance_group", e.target.value)} 
          />
        </div>
      </div>
    </div>
  );
}

function LifestyleTab({ profile, setProfile }) {
  const handleChange = (field, value) => setProfile(p => ({ ...p, [field]: value }));

  return (
    <div className="profile-section">
      <div className="profile-grid">
        <div className="input-group">
          <label>SMOKING STATUS</label>
          <select value={profile.smoking_status || ""} onChange={(e) => handleChange("smoking_status", e.target.value)}>
            <option value="">Select Status</option>
            <option value="Never Smoked">Never Smoked</option>
            <option value="Former Smoker">Former Smoker</option>
            <option value="Current Smoker">Current Smoker</option>
          </select>
        </div>
        <div className="input-group">
          <label>ALCOHOL CONSUMPTION</label>
          <select value={profile.alcohol_consumption || ""} onChange={(e) => handleChange("alcohol_consumption", e.target.value)}>
            <option value="">Select Frequency</option>
            <option value="None">None</option>
            <option value="Occasional">Occasional</option>
            <option value="Moderate">Moderate</option>
            <option value="Frequent">Frequent</option>
          </select>
        </div>
        <div className="input-group">
          <label>DIETARY PREFERENCE</label>
          <select 
            value={["", "No Restrictions", "Vegetarian", "Vegan", "Keto"].includes(profile.dietary_preference) ? (profile.dietary_preference || "") : "Other"} 
            onChange={(e) => handleChange("dietary_preference", e.target.value === "Other" ? "Other (Specify)" : e.target.value)}
          >
            <option value="">Select Diet</option>
            <option value="No Restrictions">No Restrictions</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Vegan">Vegan</option>
            <option value="Keto">Keto</option>
            <option value="Other">Other</option>
          </select>
          {!["", "No Restrictions", "Vegetarian", "Vegan", "Keto"].includes(profile.dietary_preference) && profile.dietary_preference !== undefined && (
            <input 
              type="text" 
              placeholder="Specify dietary preference" 
              value={profile.dietary_preference.replace(/^Other \(Specify\)$/, "")} 
              onChange={(e) => handleChange("dietary_preference", e.target.value)} 
              style={{ marginTop: '8px' }}
            />
          )}
        </div>
        <div className="input-group">
          <label>ACTIVITY LEVEL</label>
          <select value={profile.activity_level || ""} onChange={(e) => handleChange("activity_level", e.target.value)}>
            <option value="">Select Activity</option>
            <option value="Sedentary">Sedentary</option>
            <option value="Lightly Active">Lightly Active</option>
            <option value="Moderately Active">Moderately Active</option>
            <option value="Very Active">Very Active</option>
          </select>
        </div>
        <div className="input-group">
          <label>OCCUPATION</label>
          <input 
            type="text" 
            placeholder="Relevant for stress/exposures" 
            value={profile.occupation || ""} 
            onChange={(e) => handleChange("occupation", e.target.value)} 
          />
        </div>
      </div>
    </div>
  );
}

function MedsAllergiesTab({ profile, setProfile }) {
  const handleChange = (field, value) => setProfile(p => ({ ...p, [field]: value }));

  return (
    <div className="profile-section flex-col">
      <div className="profile-alert">
        <Pill size={16} />
        <span>Please list details clearly. We will automatically organize this for you later.</span>
      </div>

      <div className="input-group full-width">
        <label>KNOWN ALLERGIES</label>
        <textarea 
          placeholder="e.g. Peanuts (Anaphylaxis), Penicillin (Rash)" 
          value={profile.known_allergies || ""} 
          onChange={(e) => handleChange("known_allergies", e.target.value)}
        />
      </div>
      <div className="input-group full-width">
        <label>CURRENT MEDICATIONS</label>
        <textarea 
          placeholder="e.g. Lisinopril 10mg (Daily)" 
          value={profile.current_medications || ""} 
          onChange={(e) => handleChange("current_medications", e.target.value)}
        />
      </div>
      <div className="input-group full-width">
        <label>SUPPLEMENTS & OTC</label>
        <textarea 
          value={profile.supplements_otc || ""} 
          onChange={(e) => handleChange("supplements_otc", e.target.value)}
        />
      </div>
    </div>
  );
}
