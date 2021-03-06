import { useEffect, useState, useRef } from 'react'
const { io } = require('socket.io-client')
const socket = io('http://localhost:3001')

function App() {
  const [messages, setMessages] = useState([])
  const [usersList, setUsersList] = useState([])
  const [idList, setIdList] = useState([])
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
        if (msg.includes('<- you') || msg.includes('<- that')) {
          let names = msg.split('|')
          names = names.filter((x) => !x.includes('<-'))
          names = names.map((x) => x.trim())
          names = names.join()
          names = names.split(' ')
          names = names.filter(
            (x) => x != 'you' && x != 'afk' && x != 'that' && x != '<-' && x.length > 1,
          )

          setUsersList(names)
        }
      }
      setMessages((currentMessages) => [...currentMessages, msg])
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
    setUsersList([])
    socket.emit('message', `!kill`)
  }

  const clear = () => {
    setMessages([])
  }

  const greet = () => {
    socket.emit(
      'message',
      'Hello ' +
        usersList
          .join(' ')
          .replace(/[^a-z]/gi, ' ')
          .split(' ')
          .filter((x) => x)
          .map((x) => x.replace('afk', ''))
          .map((x) => x && x[0].toUpperCase() + x.slice(1))
          .join(' '),
    )
  }

  const AlwaysScrollToBottom = () => {
    const elementRef = useRef()
    useEffect(() => elementRef.current.scrollIntoView())
    return <div ref={elementRef} />
  }

  return (
    <div className="chatContainer">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="#">
          Trollegle
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item active">
              <a className="nav-link" href="#" onClick={greet}>
                Greet
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={quit}>
                End
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={clear}>
                Clear
              </a>
            </li>
          </ul>
        </div>
      </nav>
      <div className="row" name="header">
        <div className="col">
          <ul className="roomsList">
            {rooms.pulses &&
              rooms.pulses.length > 0 &&
              rooms.pulses.map((mothership, i) => (
                <li key={i} onClick={() => nick(mothership)}>
                  {mothership.room}
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className="row">
        <div className="row">
          <div className="col">
            <div className="chatBox">
              <h6>{isTyping && 'Stranger: Typing....'}</h6>
              <ul className="msgList">
                {messages.map((message, i) => (
                  <li className="messageElement" key={i}>
                    {message}
                  </li>
                ))}
              </ul>
              <AlwaysScrollToBottom />
            </div>
          </div>

          <div className="colusers">
            <span className="usersTitle" onClick={getUsers}>
              Users
            </span>
            <ul className="coUsersList">
              {usersList.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="row">
        <input
          className="msgInput"
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
              socket.emit(
                'message',
                messageInput && messageInput[0].toUpperCase() + messageInput.slice(1),
              )
              setMessageInput('')
            }
          }}
        />
      </div>
    </div>
  )
}

export default App
