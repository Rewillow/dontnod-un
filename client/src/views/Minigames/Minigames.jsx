import './Minigames.css'
import { motion } from 'framer-motion' // Importo il componente per il funzionamento della transizione da pagina a pagina 
import minigame from './miniGame'
import ClientAPI from '../../components/ClientAPI'
import { useEffect, useState } from 'react'
import {jwtDecode} from "jwt-decode"

const Minigames = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [minigameMessage, setMinigameMessage] = useState("");

  useEffect(() => {
      checkAuthentication();
  }, []);

  // const checkAuthentication = async () => {
  //   try {
  //     const response = await ClientAPI.auth(); 
  //     const responseData = response.data;
  //     setMinigameMessage(responseData.message);
  //     setAuthenticated(true);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('token')
      const decode = jwtDecode(token)
      const userId = decode.userId
      const response = await ClientAPI.authUser(userId)
      const message = response.data.message
      if(message === "Utente autenticato") {
        setAuthenticated(true)
      }
    } catch(err) {
      console.error('Utente non autenticato', err);
    }
  }
    
    return <>
    {authenticated ? (
      <motion.div className='fun' initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
        <h1>Have fun with our games</h1>
        <p className='fun--paragraph'>Play with these mini-games <br></br> (Other contents soon available...)</p>
        <div className='fun--minigames--container'>
          {minigame.map((game) => (
            <section key={game.index} className='fun--minigames--single'>
              <img src={game.imgPath} className='fun--minigames--wallpaper' />
              <div className='fun--minigames--single--info'> 
                <h2 className='fun--minigames--single--info--title'>{game.title}</h2>
                <p className='fun--minigames--single--info--paragraph'>{game.description}</p>
                <a href={game.path}><button className='fun--minigames--single--info--button'>{game.button}</button></a>
              </div>
            </section>
          ))}
        </div>
      </motion.div>
    ) : (
      <div className='fun--nolog'>
       <h2 className='fun--nolog--message'>This section is available only for registered users! <br></br> For view the content, sign-up or make login. </h2>
       <div className='fun--nolog--button--container'>
          <a href='/signup'><button className='fun--nolog--button'>SIGN UP</button></a>
          <a href='/login'><button className='fun--nolog--button'>LOGIN</button></a>
       </div>
      </div>
    )}
    </>
}

export default Minigames