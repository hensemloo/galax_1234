// TODO: build this screen from the Stitch design
import { LogOut } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

function ProfilePage() {
  const { logout } = useAuth();

  return (
    <>
      <h1 className="text-2xl font-semibold text-text">Profile</h1>

      <Button variant="secondary" fullWidth onClick={logout} className="mt-8">
        <LogOut className="size-5" aria-hidden="true" />
        Log out
      </Button>
    </>
  );
}

export default ProfilePage;
