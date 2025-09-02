import React from 'react';
import LoginForm from '../../components/Login/LoginForm';
import { useLogin } from '../../hooks/Auth/useLogin';

const LoginScreen: React.FC = () => {
  const { isLoading, errorModal, handleSocialLogin, closeErrorModal } =
    useLogin();

  return (
    <LoginForm
      isLoading={isLoading}
      errorModal={errorModal}
      onSocialLogin={handleSocialLogin}
      onCloseErrorModal={closeErrorModal}
    />
  );
};

export default LoginScreen;
