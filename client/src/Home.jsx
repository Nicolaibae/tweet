import { Link } from "react-router-dom"
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// console.log(import.meta.env)
const getGoogleAuthUrl = () => {
  const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URIS } = import.meta.env
  const url = `https://accounts.google.com/o/oauth2/v2/auth`
  console.log("redirect", VITE_GOOGLE_REDIRECT_URIS)
  const query = {
    client_id: VITE_GOOGLE_CLIENT_ID,
    redirect_uri: VITE_GOOGLE_REDIRECT_URIS,
    response_type: 'code',
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ].join(" "),
    prompt: 'consent',
    access_type: 'offline' // dùng để lấy refreshToken

  }
  const queryString = new URLSearchParams(query).toString()
  return `${url}?${queryString}`
}
const GoogleOAuthUrl = getGoogleAuthUrl()

export default function Home() {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))
  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    window.location.reload()
  }
  return (
    <>
      <div>
        <span>
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </span>
        <span>
          <img src={reactLogo} className="logo react" alt="React logo" />
        </span>
      </div>
      <h1>Google OAuth 2.0</h1>
      <p className="read-the-docs">
        {isAuthenticated ? (
          <>
          <span>Hello, chào mừng bạn đã đăng nhập thành công</span>
          <button onClick={logout}>logout</button>
          </>
          

        ) : (<Link to={GoogleOAuthUrl}>Login with Google</Link>)}

      </p>
    </>
  )
}