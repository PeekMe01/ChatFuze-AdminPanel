import React,{useState,useEffect} from 'react'
import api from './Config'
import './App.css';
import Popup from 'reactjs-popup';
import userImage from './user.png';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import debounce from 'lodash.debounce';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [option,setOption]=useState('home');
  const [users,setusers]=useState([])
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [usernotverified,setusernotverified]=useState([])
  const [feedbacks,setfeedbacks]=useState([])
  const [reports,setreports]=useState([])
  const [handledReports, setHandledReports] = useState([]);
  const[totalRooms,setTotalRooms]=useState();
  const[probablyverifiedusers,setprobablyverifieduser]=useState([]);

  const [verificationPopup, setVerificationPopup] = useState(false);
  const [editUsernamePopup, setEditUsernamePopup] = useState(false);
    const [editPasswordPopup, setEditPasswordPopup] = useState(false);
  const [deleteProfilePicPopup, setDeleteProfilePicPopup] = useState(false);
  const [banUserPopup, setBanUserPopup] = useState(false);
  const [unbanUserPopup, setUnbanUserPopup] = useState(false);
  const [username, setUsername] = useState('');
  const [password,setPassword]=useState('');
  const [reason, setReason] = useState('');

  const [viewChatHistoryPopup, setViewChatHistoryPopup] = useState(false);
  const [selectedChatHistory, setSelectedChatHistory] = useState([])
  const [reporterID, setReporterID] = useState(null);
  const [reportItem, setReportItem] = useState(null)

  useEffect(() => {
    if (selectedUser) {
      setUsername(selectedUser.username);
    }
  }, [selectedUser]);

  const handleInputChange = (event) => {
    setUsername(event.target.value);
  };

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
      deleteFile(imagepath)
    }catch (error) {
      console.error('Error deleting feedback:', error);
    }
  }

  const deleteFile = async (fileUrl) => {
    try {
      // Decode the URL to get the path
      const decodedUrl = decodeURIComponent(fileUrl);
      const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/chatfuze-e6658.appspot.com/o/';
      const filePath = decodedUrl.split(baseUrl)[1].split('?')[0];

      // Create a reference to the file to delete
      const fileRef = ref(storage, filePath);

      // Delete the file
      await deleteObject(fileRef);
      console.log('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

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
        setreports(response4.data.filter((report) => report.status === 'pending'));
        setHandledReports(response4.data.filter((report) => report.status !== 'pending'));
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

  const handleSaveNewUsername = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/settings/updateusername', {
        userid: selectedUser.idusers,
        username,
      });

      if(response){
        toast.success('Username updated successfully!');
      }
    } catch (error) {
      toast.error(error.response.data.error);
    }
    setSelectedUser(null)
    setUsername('');
    setEditUsernamePopup(false);
  }

const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/settings/updatepassword', {
        userid: selectedUser.idusers,
        password,

      });
      if(response){
        toast.success('password updated successfully!');
      }
    } catch (error) {
      toast.error(error.response.data.error);
    }
    setSelectedUser(null)
    setEditPasswordPopup(false);
  }



  const handleDeleteProfilePicture = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/accounts/removeprofilepicture', {
        idusers: selectedUser.idusers,
      });

      if(response){
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
    setSelectedUser(null)
    setDeleteProfilePicPopup(false);
  }

  const handleBanUser = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/accounts/ban_user', {
        idusers: selectedUser.idusers,
        reason
      });

      if(response){
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
    setSelectedUser(null);
    setReason('');
    setBanUserPopup(false);
  }

  const handleBanUserFromReport = async (id, reportedid, reportCategory) => {
    try {
      const response = await api.post('/accounts/ban_user', {
        idusers: reportedid,
        reason: `Due to a recent report, we have decided to ban your account for '${reportCategory}'`
      });

      const reportToUpdate = reports.find((report) => report.idreports === id);

      if (reportToUpdate) {
        // Modify the report as needed
        const updatedReport = {
          ...reportToUpdate,
          // Add or modify any properties here
          status: 'banned' // Example: adding a status property
        };

        setHandledReports((prevReports) => [
          ...prevReports,
          updatedReport
        ]);
      }
      setreports(reports.filter((report) => report.idreports !== id));

      if(response){
        const response2 = await api.post('/reports/handleReport', {
          id,
          newStatus: 'banned'
        });

        if(response2){
          toast.success(response2.data.message);
        }
      }
    } catch (error) {
      toast.error(error.response.data.message?error.response.data.message:error.response.data.error);
    }
  }

  const handleUnbanUser = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/accounts/unban_user', {
        idusers: selectedUser.idusers,
        reason
      });

      if(response){
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
    setSelectedUser(null);
    setReason('');
    setUnbanUserPopup(false);
  }

  const handleDismissReport = async (id) => {
    try {
      const response = await api.post('/reports/handleReport', {
        id,
        newStatus: 'dismissed'
      });

      if(response){
        const reportToUpdate = reports.find((report) => report.idreports === id);

        if (reportToUpdate) {
          // Modify the report as needed
          const updatedReport = {
            ...reportToUpdate,
            // Add or modify any properties here
            status: 'dismissed' // Example: adding a status property
          };

          setHandledReports((prevReports) => [
            ...prevReports,
            updatedReport
          ]);
        }
        setreports(reports.filter((report) => report.idreports !== id));
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.error);
    } 
  }
  const getFilteredUsers = () => {
    return users.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()));
  };
  return (
    <>
    <ToastContainer />
    <div className="sidebar">
      <div className="sidebar-header">
        Admin Panel
      </div>
      <ul className="sidebar-menu">
        <li><button className={option === 'home' ? 'bg' : 'bgg'} onClick={() => setOption('home')}>Home</button></li>
        <li><button className={option === 'users' ? 'bg' : 'bgg'} onClick={() => setOption('users')}>Users</button></li>
        <li><button className={option === 'verifications' ? 'bg' : 'bgg'} onClick={() => setOption('verifications')}>Verifications</button></li>
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
      {option==="verifications"&&
     
      <div>
                <div style={{textAlign:'center'}}>
                      <h1>Users Not Verified:</h1>
                </div>
                <br/>
                <hr/>
                <div className='assignmentBox'>
                    {probablyverifiedusers.map((user,index) => (
                        <div className='assignmentItem' key={index}> 
                            <div className='assignmentImageHolder' onClick={() => {setVerificationPopup(true); setSelectedUser(user)}}>
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

      {option==="users"&&  
        <div>
          <div style={{textAlign:'center'}}>
            <h1>Users:</h1>
           
          </div>
          <hr/>
          <div style={{display:'flex',justifyContent:'center'}}>
          <input
  type="text"
  placeholder="Search by username"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  style={{
   
    marginBottom: '5px',
    marginTop: '5px',
    padding: '12px 20px',
    fontSize: '18px',
    border: '2px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    outline: 'none',
    transition: 'border-color 0.3s ease-in-out',
  }}
  onFocus={(e) => e.target.style.borderColor = '#007BFF'}
  onBlur={(e) => e.target.style.borderColor = '#ccc'}
/>
</div>
          <div style={{ margin: '0 auto', width: '90%'}}>
            <table style={{ marginTop: 10 }}>
              <tr>
                  <th style={{ textAlign: 'center' }}>Username</th>
                  <th style={{ textAlign: 'center' }}>Email</th>
                  <th style={{ textAlign: 'center' }}>Profile Picture</th>
                  <th style={{ textAlign: 'center' }}>Acitons</th>
              </tr>
              {getFilteredUsers().map((user,index)=>(
                <tr>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td className="centered-image-cell">
                    <img src={user.imageurl ? user.imageurl : userImage} alt='userPic' width={150} height={150} className='assignmentPic'/>
                  </td>
                  <td>
                    <div><button className="edit-username-button" onClick={() => {setEditUsernamePopup(true); setSelectedUser(user)}}>Edit Username</button></div>
                     <div><button className="edit-username-button" onClick={() => {setEditPasswordPopup(true); setSelectedUser(user)}}>Edit Password</button></div>
                    <div><button className="delete-profile-picture-button" onClick={() => {setDeleteProfilePicPopup(true); setSelectedUser(user)}}>Delete Profile Picture</button></div>
                    <div>
                      {!user.isbanned?<button className="ban-button" onClick={() => {setBanUserPopup(true); setSelectedUser(user)}}>Ban</button>:
                      <button className="unban-button" onClick={() => {setUnbanUserPopup(true); setSelectedUser(user)}}>Unban</button>}
                      </div>
                  </td>
                </tr>
              ))}
            </table>
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
      <div style={{ margin: '0 auto', width: '90%'}}>
  <table >
    <caption>Reports:</caption>
    
    <tr>
        <th>Reporter Username</th>
        <th>Reported Username</th>
        <th>Category Name</th>
        <th>Reporter Message</th>
        <th>Actions</th>
    </tr>
    {reports.map((report)=>(
      <tr>
        <td>{report.reporterusername}</td>
        <td>{report.reportedusername}</td>
        <td>{report.categoryname}</td>
        <td>{report.message}</td>
        <td>
          <button className='unban-button' onClick={()=>{setViewChatHistoryPopup(true); setSelectedChatHistory(report.tenmessage); setReporterID(report.reporterid); setReportItem(report)}}>View Chat History</button>
          <button className='edit-username-button' onClick={()=>handleDismissReport(report.idreports)}>Dismiss</button>
          <button className='ban-button' onClick={()=>handleBanUserFromReport(report.idreports, report.reportedid, report.categoryname)}>Ban Reported User</button>
        </td>
    </tr>
    ))}
  </table>

    <table >
      <caption>Handled Reports:</caption>
      
      <tr>
          <th>Reporter Username</th>
          <th>Reported Username</th>
          <th>Category Name</th>
          <th>Reporter Message</th>
          <th>Action Taken</th>
      </tr>
      {handledReports&&handledReports.map((report)=>(
        <tr>
          <td>{report.reporterusername}</td>
          <td>{report.reportedusername}</td>
          <td>{report.categoryname}</td>
          <td>{report.message}</td>
          <td>{report.status}</td>
      </tr>
      ))}
    </table>
  </div>


      </>}
   </div>
   <Popup open={verificationPopup} onClose={() => {setVerificationPopup(false); setSelectedUser(null)}} modal nested>
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
              <img src={selectedUser.imagepath} alt="user-pic" style={{ width: '300px', height: '300px' }} onError={handleImageError}/>
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

  <Popup open={editUsernamePopup} onClose={() => {setEditUsernamePopup(false); setSelectedUser(null); setUsername('')}} modal nested>
    {(close) => (
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px black solid', marginLeft: 250 }}>
        <button style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'black' }} onClick={close}>
          &times;
        </button>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#333' }}>User Info</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 10}}>
            <h3>Username</h3>
            <input style={{ fontSize: 20 }} value={username} onChange={handleInputChange} />
            <button className="edit-username-button" onClick={handleSaveNewUsername}>Save</button>
          </form>
        </div>
      </div>
    )}
  </Popup>

<Popup open={editPasswordPopup} onClose={() => {setEditPasswordPopup(false)  ; setSelectedUser(null); setPassword('')}} modal nested>
    {(close) => (
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px black solid', marginLeft: 250 }}>
        <button style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'black' }} onClick={close}>
          &times;
        </button>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#333' }}>User Info</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 10}}>
            <h3>Password</h3>
            <input style={{ fontSize: 20 }} placeholder='Change User Password' value={password} onChange={(e)=>setPassword(e.target.value)} />
            <button className="edit-username-button" onClick={handleSaveNewPassword}>Save</button>
          </form>
        </div>
      </div>
    )}
  </Popup>



  <Popup open={deleteProfilePicPopup} onClose={() => {setDeleteProfilePicPopup(false); setSelectedUser(null)}} modal nested>
    {(close) => (
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px black solid', marginLeft: 250 }}>
        <button style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'black' }} onClick={close}>
          &times;
        </button>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'red' }}>Warning!</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <label>Are you sure you want to delete this user's profile picture?</label>
            <button className="delete-profile-picture-button" onClick={handleDeleteProfilePicture}>Yes, Delete</button>
        </div>
      </div>
    )}
  </Popup>

  <Popup open={banUserPopup} onClose={() => {setBanUserPopup(false); setSelectedUser(null); setReason('')}} modal nested>
    {(close) => (
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px black solid', marginLeft: 250 }}>
        <button style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'black' }} onClick={close}>
          &times;
        </button>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'red' }}>Warning!</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 10}}>
            <h3>Reason</h3>
            <input style={{ fontSize: 20 }} value={reason} onChange={(event)=>{setReason(event.target.value)}} placeholder='Enter reason for ban...'/>
            <button className="ban-button" onClick={handleBanUser}>Ban</button>
          </form>
        </div>
      </div>
    )}
  </Popup>
  <Popup open={unbanUserPopup} onClose={() => {setUnbanUserPopup(false); setSelectedUser(null); setReason('')}} modal nested>
    {(close) => (
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px black solid', marginLeft: 250 }}>
        <button style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'black' }} onClick={close}>
          &times;
        </button>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'red' }}>Warning!</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 10}}>
            <h3>Reason</h3>
            <input style={{ fontSize: 20 }} value={reason} onChange={(event)=>{setReason(event.target.value)}} placeholder='Enter reason for unban...'/>
            <button className="unban-button" onClick={handleUnbanUser}>Unban</button>
          </form>
        </div>
      </div>
    )}
  </Popup>
  <Popup open={viewChatHistoryPopup} onClose={() => {setViewChatHistoryPopup(false); setSelectedChatHistory(null); setReporterID(null)}} modal nested>
    {(close) => (
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px black solid', marginLeft: 250, width: 300, height: 400 }}>
        <button style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'black' }} onClick={close}>
          &times;
        </button>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2>Chat History</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'scroll', height: 300 }}>
          {
            !selectedChatHistory?<p style={{ textAlign: 'center' }}>No chat history!</p>:selectedChatHistory.length==0?<p>No chat history!</p>:<></>
          }
          {
            selectedChatHistory&&selectedChatHistory.map((message,index) => {
              return(
                <div 
                  key={index} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: message.user._id == reporterID ? 'flex-start' : 'flex-end', 
                    margin: '0 10px' 
                  }}
                >
                  <p style={{ 
                      color: 'white',
                      backgroundColor: message.user._id == reporterID ? '#007bff' : '#f44336', 
                      padding: 5, 
                      display: 'inline-block',
                      borderRadius: '5px' // Optional: Adds a slight border radius for better aesthetics
                    }}>
                      {message.text}
                  </p>
                </div>
              )
            })
          }
        </div>
        <div>
          <h3 style={{ paddingTop: 20 }}>Report Reason: </h3><p>{reportItem&&reportItem.categoryname}</p>
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