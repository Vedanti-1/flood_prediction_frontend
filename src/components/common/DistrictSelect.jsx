import React from 'react';

export const MAHARASHTRA_DISTRICTS = [
  'Ahmednagar',
  'Akola',
  'Amravati',
  'Aurangabad',
  'Beed',
  'Bhandara',
  'Buldhana',
  'Chandrapur',
  'Dharashiv',
  'Dhule',
  'Gadchiroli',
  'Gondia',
  'Hingoli',
  'Jalgaon',
  'Jalna',
  'Kolhapur',
  'Latur',
  'Mumbai Suburban',
  'Nagpur',
  'Nanded',
  'Nandurbar',
  'Nashik',
  'Palghar',
  'Parbhani',
  'Pune',
  'Raigad',
  'Ratnagiri',
  'Sangli',
  'Satara',
  'Sindhudurg',
  'Solapur',
  'Thane',
  'Wardha',
  'Washim',
  'Yavatmal',
];

const DistrictSelect = ({
  value = '',
  onChange,
  placeholder = 'Select district...',
}) => {
  return (
    <select
      className="form-select"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      aria-label="Select district"
    >
      <option value="">{placeholder}</option>

      {MAHARASHTRA_DISTRICTS.map((district) => (
        <option key={district} value={district}>
          {district}
        </option>
      ))}
    </select>
  );
};

export default DistrictSelect;