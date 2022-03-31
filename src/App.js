import { useEffect, useState } from 'react'
const { io } = require('socket.io-client')
const socket = io('http://localhost:3001')

function App() {
  const [messages, setMessages] = useState([])
  const [usersList, setUsersList] = useState([])
  const [rooms, setRooms] = useState({})
  const [isTyping, setIsTyping] = useState(false)
  const [messageInput, setMessageInput] = useState('')

  useEffect(() => {
    socket.on('message', (msg) => {
      setIsTyping(false)
      if (msg && msg.includes('Stranger:')) {
        msg = msg.split('Stranger:')[1]
      }
      if (msg) {
        if (msg.includes('<- you') || msg.includes("that's you")) {
          let names = msg.split('|')
          names = names.map((x) => x.trim())
          names = names.join()
          names = names.split(' ')
          names = names.filter((x) => x != 'you' && x != '<-' && x.length > 1)
          setUsersList(names)
        }
      }
      setMessages((currentMessages) => [msg, ...currentMessages])
    })
    socket.on('startedTyping', () => {
      setIsTyping(true)
    })
    socket.on('stoppedTyping', () => {
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

  const nick = (mothership) => {
    socket.emit('message', `!set ${mothership.words.join(' ')}`)
    socket.emit('message', `!start`)
  }

  const getUsers = () => {
    socket.emit('message', `/showids`)
    socket.emit('message', `/list`)
  }

  const quit = () => {
    socket.emit('message', `!kill`)
  }

  const handleMessage = (msg) => {
    if (msg.includes('<- you')) {
      let names = msg.split('|')
      names = names.map((x) => x.trim())
      names = names.join()
      names = names.split(' ')
      names = names.filter((x) => x != 'you' && x != '<-')
      setUsersList(names)
    }
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
        <div class="colQuit" onClick={quit}>
          End
        </div>
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
            <span class="usersTitle" onClick={getUsers}>
              Users
            </span>
            <ul class="coUsersList">
              {usersList.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
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
