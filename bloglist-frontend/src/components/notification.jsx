// components/Notification.js
const Notification = ({ message, type }) => {
    if (message === null) {
      return null
    }
  
    const notificationStyle = {
      background: 'lightgrey',
      fontSize: 20,
      borderStyle: 'solid',
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
      color: type === 'error' ? 'red' : 'green'
    }
  
    return (
      <div style={notificationStyle} className="error">
        {message}
      </div>
    )
  }
  
  export default Notification