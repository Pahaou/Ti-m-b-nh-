import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Spinner } from '../components/LoadingSpinner';
import { useApi } from '../hooks/useApi';

/* ─── Modular Components ─── */
import ProfileInfoForm from '../components/profile/ProfileInfoForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import AddressBook from '../components/profile/AddressBook';

export default function ProfilePage() {
  const { showSuccess, showError } = useToast();

  const { data: profileData, loading: loadingProfile, execute: fetchProfileApi } = useApi(authAPI.getProfile);
  const { loading: updatingProfile, execute: updateProfileApi } = useApi(authAPI.updateProfile);
  const { loading: updatingPass, execute: changePasswordApi } = useApi(authAPI.changePassword);
  const { loading: addingAddr, execute: addAddressApi } = useApi(authAPI.addAddress);
  const { execute: deleteAddressApi } = useApi(authAPI.deleteAddress);

  const profile = profileData?.data;

  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newAddrStr, setNewAddrStr] = useState('');

  useEffect(() => {
    fetchProfileApi();
  }, [fetchProfileApi]);

  useEffect(() => {
    if (profile) {
      setFullname(profile.fullname);
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfileApi({ fullname, phone });
      showSuccess('Cập nhật thông tin thành công!');
    } catch (err) {
      showError(err.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const handleChangePass = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    try {
      await changePasswordApi({ currentPassword, newPassword });
      showSuccess('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showError(err.response?.data?.message || 'Đổi mật khẩu thất bại!');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddressApi({
        receiver_name: fullname,
        receiver_phone: phone || '',
        address_detail: newAddrStr,
        is_default: profile.addresses.length === 0
      });
      showSuccess('Đã thêm địa chỉ!');
      setNewAddrStr('');
      fetchProfileApi();
    } catch {
      showError('Thêm địa chỉ thất bại');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddressApi(id);
      showSuccess('Đã xóa địa chỉ');
      fetchProfileApi();
    } catch {
      showError('Lỗi xóa địa chỉ');
    }
  };

  if (loadingProfile && !profile) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 150, minHeight: '80vh' }}>
        <Spinner size={40} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: '80vh' }}>
      <h1 style={{ marginBottom: 40, fontWeight: 800 }}>👤 Hồ Sơ Của Tôi</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          <ProfileInfoForm 
            profile={profile} 
            fullname={fullname} 
            setFullname={setFullname} 
            phone={phone} 
            setPhone={setPhone} 
            onSubmit={handleUpdateProfile} 
            isLoading={updatingProfile} 
          />
          <ChangePasswordForm 
            currentPassword={currentPassword} 
            setCurrentPassword={setCurrentPassword} 
            newPassword={newPassword} 
            setNewPassword={setNewPassword} 
            onSubmit={handleChangePass} 
            isLoading={updatingPass} 
          />
        </div>

        <div>
          <AddressBook 
            addresses={profile?.addresses} 
            newAddrStr={newAddrStr} 
            setNewAddrStr={setNewAddrStr} 
            onAdd={handleAddAddress} 
            onDelete={handleDeleteAddress} 
            isAdding={addingAddr} 
          />
        </div>
      </div>
    </div>
  );
}
