import React from "react";

const COUNTRY_CODES = [
  { code: "+93", country: "AF" }, { code: "+355", country: "AL" }, { code: "+213", country: "DZ" },
  { code: "+376", country: "AD" }, { code: "+244", country: "AO" }, { code: "+54", country: "AR" },
  { code: "+374", country: "AM" }, { code: "+61", country: "AU" }, { code: "+43", country: "AT" },
  { code: "+994", country: "AZ" }, { code: "+973", country: "BH" }, { code: "+880", country: "BD" },
  { code: "+375", country: "BY" }, { code: "+32", country: "BE" }, { code: "+501", country: "BZ" },
  { code: "+229", country: "BJ" }, { code: "+975", country: "BT" }, { code: "+591", country: "BO" },
  { code: "+387", country: "BA" }, { code: "+267", country: "BW" }, { code: "+55", country: "BR" },
  { code: "+673", country: "BN" }, { code: "+359", country: "BG" }, { code: "+226", country: "BF" },
  { code: "+257", country: "BI" }, { code: "+855", country: "KH" }, { code: "+237", country: "CM" },
  { code: "+1", country: "CA" }, { code: "+238", country: "CV" }, { code: "+236", country: "CF" },
  { code: "+235", country: "TD" }, { code: "+56", country: "CL" }, { code: "+86", country: "CN" },
  { code: "+57", country: "CO" }, { code: "+269", country: "KM" }, { code: "+242", country: "CG" },
  { code: "+243", country: "CD" }, { code: "+506", country: "CR" }, { code: "+225", country: "CI" },
  { code: "+385", country: "HR" }, { code: "+53", country: "CU" }, { code: "+357", country: "CY" },
  { code: "+420", country: "CZ" }, { code: "+45", country: "DK" }, { code: "+253", country: "DJ" },
  { code: "+1", country: "DO" }, { code: "+593", country: "EC" }, { code: "+20", country: "EG" },
  { code: "+503", country: "SV" }, { code: "+240", country: "GQ" }, { code: "+291", country: "ER" },
  { code: "+372", country: "EE" }, { code: "+251", country: "ET" }, { code: "+679", country: "FJ" },
  { code: "+358", country: "FI" }, { code: "+33", country: "FR" }, { code: "+241", country: "GA" },
  { code: "+220", country: "GM" }, { code: "+995", country: "GE" }, { code: "+49", country: "DE" },
  { code: "+233", country: "GH" }, { code: "+30", country: "GR" }, { code: "+502", country: "GT" },
  { code: "+224", country: "GN" }, { code: "+245", country: "GW" }, { code: "+592", country: "GY" },
  { code: "+509", country: "HT" }, { code: "+504", country: "HN" }, { code: "+36", country: "HU" },
  { code: "+354", country: "IS" }, { code: "+91", country: "IN" }, { code: "+62", country: "ID" },
  { code: "+98", country: "IR" }, { code: "+964", country: "IQ" }, { code: "+353", country: "IE" },
  { code: "+972", country: "IL" }, { code: "+39", country: "IT" }, { code: "+1", country: "JM" },
  { code: "+81", country: "JP" }, { code: "+962", country: "JO" }, { code: "+7", country: "KZ" },
  { code: "+254", country: "KE" }, { code: "+686", country: "KI" }, { code: "+850", country: "KP" },
  { code: "+82", country: "KR" }, { code: "+965", country: "KW" }, { code: "+996", country: "KG" },
  { code: "+856", country: "LA" }, { code: "+371", country: "LV" }, { code: "+961", country: "LB" },
  { code: "+266", country: "LS" }, { code: "+231", country: "LR" }, { code: "+218", country: "LY" },
  { code: "+423", country: "LI" }, { code: "+370", country: "LT" }, { code: "+352", country: "LU" },
  { code: "+389", country: "MK" }, { code: "+261", country: "MG" }, { code: "+265", country: "MW" },
  { code: "+60", country: "MY" }, { code: "+960", country: "MV" }, { code: "+223", country: "ML" },
  { code: "+356", country: "MT" }, { code: "+692", country: "MH" }, { code: "+222", country: "MR" },
  { code: "+230", country: "MU" }, { code: "+52", country: "MX" }, { code: "+691", country: "FM" },
  { code: "+373", country: "MD" }, { code: "+377", country: "MC" }, { code: "+976", country: "MN" },
  { code: "+382", country: "ME" }, { code: "+212", country: "MA" }, { code: "+258", country: "MZ" },
  { code: "+95", country: "MM" }, { code: "+264", country: "NA" }, { code: "+674", country: "NR" },
  { code: "+977", country: "NP" }, { code: "+31", country: "NL" }, { code: "+64", country: "NZ" },
  { code: "+505", country: "NI" }, { code: "+227", country: "NE" }, { code: "+234", country: "NG" },
  { code: "+47", country: "NO" }, { code: "+968", country: "OM" }, { code: "+92", country: "PK" },
  { code: "+680", country: "PW" }, { code: "+507", country: "PA" }, { code: "+675", country: "PG" },
  { code: "+595", country: "PY" }, { code: "+51", country: "PE" }, { code: "+63", country: "PH" },
  { code: "+48", country: "PL" }, { code: "+351", country: "PT" }, { code: "+974", country: "QA" },
  { code: "+40", country: "RO" }, { code: "+7", country: "RU" }, { code: "+250", country: "RW" },
  { code: "+1", country: "KN" }, { code: "+1", country: "LC" }, { code: "+1", country: "VC" },
  { code: "+685", country: "WS" }, { code: "+378", country: "SM" }, { code: "+239", country: "ST" },
  { code: "+966", country: "SA" }, { code: "+221", country: "SN" }, { code: "+381", country: "RS" },
  { code: "+248", country: "SC" }, { code: "+232", country: "SL" }, { code: "+65", country: "SG" },
  { code: "+421", country: "SK" }, { code: "+386", country: "SI" }, { code: "+677", country: "SB" },
  { code: "+252", country: "SO" }, { code: "+27", country: "ZA" }, { code: "+34", country: "ES" },
  { code: "+94", country: "LK" }, { code: "+249", country: "SD" }, { code: "+597", country: "SR" },
  { code: "+268", country: "SZ" }, { code: "+46", country: "SE" }, { code: "+41", country: "CH" },
  { code: "+963", country: "SY" }, { code: "+886", country: "TW" }, { code: "+992", country: "TJ" },
  { code: "+255", country: "TZ" }, { code: "+66", country: "TH" }, { code: "+228", country: "TG" },
  { code: "+676", country: "TO" }, { code: "+1", country: "TT" }, { code: "+216", country: "TN" },
  { code: "+90", country: "TR" }, { code: "+993", country: "TM" }, { code: "+688", country: "TV" },
  { code: "+256", country: "UG" }, { code: "+380", country: "UA" }, { code: "+971", country: "AE" },
  { code: "+44", country: "GB" }, { code: "+1", country: "US" }, { code: "+598", country: "UY" },
  { code: "+998", country: "UZ" }, { code: "+678", country: "VU" }, { code: "+58", country: "VE" },
  { code: "+84", country: "VN" }, { code: "+967", country: "YE" }, { code: "+260", country: "ZM" },
  { code: "+263", country: "ZW" }
].sort((a, b) => a.country.localeCompare(b.country));

// Move IN, US, GB to top
const topCodes = ["IN", "US", "GB"];
const sortedCountryCodes = [
  ...COUNTRY_CODES.filter(c => topCodes.includes(c.country)).sort((a, b) => topCodes.indexOf(a.country) - topCodes.indexOf(b.country)),
  ...COUNTRY_CODES.filter(c => !topCodes.includes(c.country))
];

export function PhoneInput({ countryCode, onCountryCodeChange, phone, onPhoneChange }) {
  const selectedCountry = sortedCountryCodes.find(c => c.code === countryCode) || sortedCountryCodes[0];

  return (
    <div className="login-phone-row">
      <select
        value={countryCode}
        onChange={(e) => onCountryCodeChange(e.target.value)}
        className="login-phone-prefix"
      >
        {sortedCountryCodes.map((c, i) => (
          <option key={`${c.country}-${i}`} value={c.code}>
            {c.country} ({c.code})
          </option>
        ))}
      </select>
      <input
        id="phone"
        type="tel"
        inputMode="numeric"
        className="login-phone-input"
        placeholder="98765 43210"
        value={phone}
        maxLength={10}
        onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
        autoComplete="tel-national"
      />
    </div>
  );
}
