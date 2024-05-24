import Cookies from 'js-cookie';

const RefreshToken = async () => 
{
  const refresh_token = Cookies.get("refresh_token");
  const client_id = Cookies.get("client_id");
  let item = {client_id,refresh_token};

  let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/client/login-refresh`,{
    method:"POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body:JSON.stringify(item)
  });
  result = await result.json();
  
  if(result.error)
  {
    return false;
  }
  else
  {
    sessionStorage.setItem("details", JSON.stringify(result));
    Cookies.set('refresh_token', result.refresh_token, { expires: 7 });
    Cookies.set('client_id', result.client_id, { expires: 7 });
    return result.jwt_token;
  }
};

export default RefreshToken;
