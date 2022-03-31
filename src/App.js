import { useEffect, useState } from 'react'
const { io } = require('socket.io-client')
const socket = io('http://localhost:3001')

function App() {
  const [messages, setMessages] = useState([])
  const [rooms, setRooms] = useState({})
  const [isTyping, setIsTyping] = useState(false)
  const [messageInput, setMessageInput] = useState('')

  useEffect(() => {
    socket.on('message', (msg) => {
      setIsTyping(false)
      setMessages((currentMessages) => [msg, ...currentMessages])
    })
    socket.on('started-typing', () => {
      setIsTyping(true)
    })
    socket.on('stopped-typing', () => {
      setIsTyping(false)
    })
  }, [])

  useEffect(() => {
    setInterval(async () => {
      try {
        const res = await fetch('https://bellawhiskey.ca/trollegle/raw')
        const roomsResponse = await res.json()
        setRooms(roomsResponse)
      } catch (e) {
        console.log(e)
      }
    }, 3000)
  }, [])

  const nick = (message) => {
    socket.emit('message', `!stop`)
    socket.emit('message', `!set ${message.words.join(' ')}`)
    socket.emit('message', `!start`)
  }
  return (
    <div class="chatContainer">
      <div class="row" name="header">
        <div class="col">
          <h1 class="chatTitle">{'Trollegle'}</h1>
          <ul class="roomsList">
            {rooms.pulses &&
              rooms.pulses.length > 0 &&
              rooms.pulses.map((mothership, i) => (
                <li key={i} onClick={() => nick(mothership)}>
                  {mothership.room}
                </li>
              ))}
          </ul>
        </div>
        <div class="colQuit">ok</div>
      </div>
      <div class="row">
        <div class="row">
          <div class="col">
            <div class="chatBox">
              <h6>{isTyping && 'Stranger: Typing....'}</h6>
              <ul class="msgList">
                {messages.map((message, i) => (
                  <li class="messageElement" key={i}>
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div class="colusers">
            <span class="usersTitle">Users</span>
            <ul class="coUsersList">
              <li key={'1'}>John</li>
              <li key={'2'}>Jane</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="row">
        <input
          class="msgInput"
          type="text"
          onChange={(e) => {
            if (e.target.value === '') {
              socket.emit('stopTyping')
            } else if (e.target.value.split('').length === 1) {
              socket.emit('startTyping')
            }
            setMessageInput(e.target.value)
          }}
          value={messageInput}
          name="message"
          aria-label="Default"
          aria-describedby="inputGroup-sizing-default"
          placeholder="Enter a message ..."
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              socket.emit('message', messageInput)
              setMessageInput('')
            }
          }}
        />
      </div>
    </div>
  )
}

export default App
