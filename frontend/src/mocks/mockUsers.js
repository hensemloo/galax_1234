// Demo accounts for the mock login (VITE_USE_MOCK=true only).
// These are NOT real credentials. Passwords live here only because this is a frontend mock.
// role stays 'staff' / 'admin' in code; the UI shows "Field officer" / "Supervisor".
export const mockUsers = [
  {
    id: 'U-001',
    name: 'Aina',
    staffId: 'LKM-TWU-0142',
    email: 'staff@cocoacheck.my',
    password: 'demo1234',
    role: 'staff',
  },
  {
    id: 'U-002',
    name: 'Supervisor Demo',
    staffId: 'LKM-TWU-0007',
    email: 'admin@cocoacheck.my',
    password: 'demo1234',
    role: 'admin',
  },
  {
    // Second field officer, so we can check that officers only see their own inspections.
    id: 'U-003',
    name: 'Hafiz',
    staffId: 'LKM-TWU-0158',
    email: 'hafiz@cocoacheck.my',
    password: 'demo1234',
    role: 'staff',
  },
];
