import { useState, useEffect } from "react";

export default function GroupChat({ groupId, user, onBack }) {
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const fetchDetails = async () => {
    const res = await fetch(`http://localhost:5001/group-details/${groupId}`);
    const data = await res.json();
    if (data.ok) {
      setMessages(data.messages);
      setMembers([data.teacher, ...data.members]); // Include teacher in member list
    }
  };

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(fetchDetails, 3000); // Poll for new messages
    return () => clearInterval(interval);
  }, [groupId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await fetch("http://localhost:5001/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, username: user.username, text: newMessage })
    });
    setNewMessage("");
    fetchDetails();
  };

  return (
    <div className="ChatContainer">
      <button className="DashBtn" onClick={onBack}>Back to Dashboard</button>
      <div className="ChatLayout" style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
        {/* Message Area */}
        <div className="MessageSection" style={{ flex: 3, background: '#222', padding: '15px', borderRadius: '8px' }}>
          <div className="MessageList" style={{ height: '300px', overflowY: 'auto', marginBottom: '10px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: '10px', textAlign: m.sender === user.username ? 'right' : 'left' }}>
                <b style={{ color: '#007bff' }}>{m.sender}</b>: <span>{m.text}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
            <button className="DashBtn" onClick={sendMessage}>Send</button>
          </div>
        </div>

        {/* Members Sidebar */}
        <div className="MemberSection" style={{ flex: 1, background: '#333', padding: '15px', borderRadius: '8px' }}>
          <h4>Members</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {members.map((m, i) => <li key={i} style={{ fontSize: '0.9em' }}>👤 {m}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}