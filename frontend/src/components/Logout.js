import Cookies from 'js-cookie';

const Logout = async () => 
{
  window.location.reload();
  window.location.href = "/";
  sessionStorage.clear()
  Cookies.remove('refresh_token');
  Cookies.remove('client_id');
};

export default Logout;
