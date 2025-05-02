const NotificationsPage = () => {
  return (
    <div>
      
      <h1>Notification Page</h1>
      <p>You have no new notifications.</p>
      <button onClick={() => alert('Check again later!')}>Refresh</button>
    </div>
  )
}

export default NotificationsPage
