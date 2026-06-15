export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Administrador Hospitalario',
  DOCTOR_A: 'Médico A',
  DOCTOR_B: 'Médico B',
  DOCTOR_C: 'Médico C',
  SPECIALIST: 'Especialista',
  NURSE_A: 'Enfermera A',
  NURSE_B: 'Enfermera B',
  NURSE_C: 'Enfermera C',
  PHARMACIST: 'Farmacéutico',
  PHARMACY_ADMIN: 'Admin Farmacia',
  EMERGENCY_DOCTOR: 'Urgenciólogo',
};

export const getDashboardByRole = (role) => {
  const roleMap = {
    [ROLES.SUPER_ADMIN]: 'AdminDashboard',
    [ROLES.ADMIN]: 'AdminDashboard',
    [ROLES.DOCTOR_A]: 'DoctorDashboard',
    [ROLES.DOCTOR_B]: 'DoctorDashboard',
    [ROLES.DOCTOR_C]: 'DoctorDashboard',
    [ROLES.SPECIALIST]: 'DoctorDashboard',
    [ROLES.EMERGENCY_DOCTOR]: 'DoctorDashboard',
    [ROLES.NURSE_A]: 'NurseDashboard',
    [ROLES.NURSE_B]: 'NurseDashboard',
    [ROLES.NURSE_C]: 'NurseDashboard',
    [ROLES.PHARMACIST]: 'PharmacyDashboard',
    [ROLES.PHARMACY_ADMIN]: 'PharmacyDashboard',
  };
  return roleMap[role] || 'LoginScreen';
};