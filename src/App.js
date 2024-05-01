import React,{useState,useEffect} from 'react'
import api from './Config'
import './App.css';
import Popup from 'reactjs-popup';
import userImage from './user.png';
const App = () => {
  const [option,setOption]=useState('home');
  const [users,setusers]=useState([])
  const [selectedUser, setSelectedUser] = useState(null);
  const [usernotverified,setusernotverified]=useState([])
  const [feedbacks,setfeedbacks]=useState([])
  const [reports,setreports]=useState([])
  const[totalRooms,setTotalRooms]=useState();
  const[probablyverifiedusers,setprobablyverifieduser]=useState([]);
  const deleteFeedback = async (id) => {
    try {
      const response = await api.post(`/feedbacks/deletefeedback`, { id });
      console.log('Feedback deleted successfully');
      setfeedbacks(feedbacks.filter((feedback) => feedback.id !== id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };
  const deleteReports=async(id)=>{
    try {
      const response = await api.post(`/reports/deletereport`, { id });
      console.log('Report deleted successfully');
      setreports(reports.filter((report) => report.idreports !== id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  }
  const accepted=(idverificationrequests,imagepath,userid,accepted,closePopup)=>{

    try {
      closePopup();
    const response =  api.post('/Accounts/verify_user', {
                      idverificationrequests,
                      imagepath,
                      userid,
                      accepted
                  });
      setprobablyverifieduser(probablyverifiedusers.filter((user)=>user.idverificationrequests!==idverificationrequests))
      console.log(response.data)     
      }catch (error) {
        console.error('Error deleting feedback:', error);
      }
    }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response1 = await api.get(`/leaderboard/global`);
        setusers(response1.data);
        const response2 = await api.get(`/Accounts/getNonVerifiedUsers`);
        setusernotverified(response2.data);
        const response3 = await api.get(`/feedbacks/getallfeedbacks`);
        setfeedbacks(response3.data);
        const response4 = await api.get(`/reports/getallreports`);
        setreports(response4.data);
        const response5=await api.get(`/Accounts/totalrooms`);
        setTotalRooms(response5.data);
        const response6=await api.get(`/Accounts/getProbablyVerifiedUsers`);
        setprobablyverifieduser(response6.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);

  const handleImageError = () => {
    setSelectedUser({ ...selectedUser, imagepath: '' });
  };

  return (
    <>
    <div className="sidebar">
      <div className="sidebar-header">
        Admin Panel
      </div>
      <ul className="sidebar-menu">
        <li><button className={option === 'home' ? 'bg' : 'bgg'} onClick={() => setOption('home')}>Home</button></li>
        <li><button className={option === 'users' ? 'bg' : 'bgg'} onClick={() => setOption('users')}>Users</button></li>
        <li><button className={option === 'feedbacks' ? 'bg' : 'bgg'} onClick={() => setOption('feedbacks')}>Feedbacks</button></li>
        <li><button className={option === 'reports' ? 'bg' : 'bgg'} onClick={() => setOption('reports')}>Reports</button></li>
      </ul>
    </div>
   <div className='content'>
      {option==="home"&&
      <>
      <div className="table-container">
  <table>
    <caption>Summary Statistics:</caption>
    <tr><th></th><th>Total</th></tr>
    <tr>
      <td>Users</td>
      <td>{users.length}</td>
    </tr>
    <tr>
      <td> Rooms</td>
      <td>{totalRooms}</td>
    </tr>
    <tr>
      <td>Users Verified</td>
      <td>{users.length - usernotverified.length}</td>
    </tr>
    <tr>
      <td>Users Not Verified</td>
      <td>{usernotverified.length}</td>
    </tr>
    <tr>
      <td> Feedbacks</td>
      <td>{feedbacks.length}</td>
    </tr>
    <tr>
      <td> Reports</td>
      <td>{reports.length}</td>
    </tr>
    
  </table>
</div>
      
      </>}
      {option==="users"&&
     
      <div>
                <div style={{textAlign:'center'}}>
                      <h1>Users Not Verified:</h1>
                </div>
                <br/>
                <hr/>
                <div className='assignmentBox'>
                    {probablyverifiedusers.map((user,index) => (
                        <div className='assignmentItem' key={index}> 
                            <div className='assignmentImageHolder' onClick={() => setSelectedUser(user)}>
                                <img src={userImage} alt='userPic' width={150} height={150} className='assignmentPic'/>
                            </div>
                            <div style={{  paddingTop: 5 ,display:'flex',alignItems:'center',flexDirection:'column'}}>
                            <h2 style={{ marginBottom: '10px', fontSize: '1.5em' }}>Username: {user.username}</h2>
                      <p style={{ fontSize: '1.2em', marginBottom: '5px' }}>Email: {user.email}</p>
                      
                            </div>
                        </div>
                    ))}
                </div>
      </div>

      }

      {option==="feedbacks"&&
      <>
      <div className="table-container">
  <table >
    <caption>Feedbacks Messages:</caption>
    <tr>
        <th>Username</th>
        <th>Email</th>
        <th>Message</th>
        <th>Delete</th>
    </tr>
    {feedbacks.map((feedback)=>(
      <tr>
        <td>{feedback.username}</td>
        <td>{feedback.email}</td>
        <td>{feedback.message}</td>
        <td><button onClick={()=>deleteFeedback(feedback.id)}>Delete</button></td>
    </tr>
    ))}
  </table>
</div>

      </>}
      {option==="reports"&&
      <>
      
  <table >
    <caption>Reports Information:</caption>
    
    <tr>
        <th>Reporter Username</th>
        <th>Reported Username</th>
        <th>Category Name</th>
        <th>Reporter Message</th>
        <th>Delete</th>
    </tr>
    {reports.map((report)=>(
      <tr>
        <td>{report.reporterusername}</td>
        <td>{report.reportedusername}</td>
        <td>{report.categoryname}</td>
        <td>{report.message}</td>
        <td><button onClick={()=>deleteReports(report.idreports)}>Delete</button></td>
    </tr>
    ))}
  </table>


      </>}
   </div>
   <Popup open={selectedUser !== null} onClose={() => setSelectedUser(null)} modal nested>
    {(close) => (
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px black solid' }}>
        <button style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'black' }} onClick={close}>
          &times;
        </button>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#333' }}>User Info</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {selectedUser && (
            <div style={{ textAlign: 'left' }}>
              <p>Username: {selectedUser.username}</p>
              <p>Email: {selectedUser.email}</p>
              <p>Country: {selectedUser.country}</p>
              <p>Gender: {selectedUser.gender} </p>
              <p>Date of Birth: {selectedUser.dateOfBirth && selectedUser.dateOfBirth.slice(0, 10)}</p>
              <img src={require(`../../server/uploads/${selectedUser.imagepath}`).default} alt="user-pic" style={{ width: '300px', height: '300px' }} onError={handleImageError}/>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' ,justifyContent:'center'}}>
              <button style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={() => accepted(selectedUser.idverificationrequests, selectedUser.imagepath, selectedUser.userid, true, close)}>Submit</button>
              <button style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={() => accepted(selectedUser.idverificationrequests, selectedUser.imagepath, selectedUser.userid, false, close)}>Reject</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </Popup>
   </>
  )
}

export default App




/*
 <div className={styles.assignmentBox}>
    {probablyverifiedusers.map((user) => (
        <div className={styles.assignmentItem} >
            <div className={styles.assignmentImageHolder}>
                <img src={userImage} alt='userPic' width={150} height={150} className={styles.assignmentPic}/>
            </div>
            <div style={{ color: 'white', paddingTop: 5 }}>{user.username}</div>
            
        </div>*/