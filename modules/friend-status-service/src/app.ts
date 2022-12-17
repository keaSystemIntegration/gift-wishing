import express from "express";
import http from "http";
import dotenv from "dotenv";
import { Server, Socket } from "socket.io";
import cookieParser from 'cookie-parser';

const app = express();
const server = http.createServer(app);

// app.use(express.static("public"));
app.use(cookieParser());
dotenv.config();

const io = new Server<ClientToServerEvents, ServerToClientEvents> (server, {
  cors: {
    origin: ["*"],
    allowedHeaders: ["Authorization"]
  }
});

interface IFriend {
  username: string,
  userId: string,
  status?: string
};

interface IFriendsList {
  friendsList: IFriend[]
};

interface ServerToClientEvents {
  friends_status: (friendsList: IFriend[]) => void,
  update_user_status: (USER_SOCKET_ROOM: string, status: String) => void
};

interface ClientToServerEvents {
  user_connected: (friendsList: IFriendsList) => void
};

function getFriendsStatusAndNotifyFriends(USER_SOCKET_ROOM: string, FRIENDS_LIST: any[], socket: Socket) {
  if ( FRIENDS_LIST.length ) {
    FRIENDS_LIST.forEach( (friend: any) => {
      // get friend's socket room
      const friendSocketRoom = friend.userId;
  
      // console.log(io.sockets.adapter.rooms.get(friendSocketRoom))
      if (friend.username == null) {
        friend.status = 'not registered';
      } else
      // if the friend's room exists it means the friend is online
      if (io.sockets.adapter.rooms.get(friendSocketRoom)) {
        // emit to friend that user is on
        socket.to(friendSocketRoom).emit("update_user_status", USER_SOCKET_ROOM, 'on');
        // set friend status for the user
        friend.status = 'on';
      } else {
        friend.status = 'off';
      }
    });
    return FRIENDS_LIST;
  } else {
    return [];
  }
}

io.on("connection", (socket: Socket) => {
  // console.log('\n\n=========NEW CONNECTION==========')
  // console.log('HEADER', socket.handshake.headers);
  let USER_SOCKET_ROOM = '';
  let FRIENDS_LIST: any = [];

  socket.on("user_connected", ({friendsList}: IFriendsList) => {  
      

    const { userId, email } = JSON.parse(socket.handshake.headers.cookie?.split('=')[1] || '{}');
    
    USER_SOCKET_ROOM = userId;
    FRIENDS_LIST = friendsList || [];

    //the user creates an unique socket room based on userId received from cookies claims which
    // is joined by each separate connection of the user
    socket.join(USER_SOCKET_ROOM)

    // get list of friends with statuses and notify active friends that the user is online
    const friendsWithStatusList = getFriendsStatusAndNotifyFriends(USER_SOCKET_ROOM, FRIENDS_LIST, socket);
    // emit to user the list of friends with their statuses
    socket.emit("friends_status", friendsWithStatusList);
  });

  socket.on("disconnect", () => {
    if (FRIENDS_LIST && FRIENDS_LIST.length) {
      FRIENDS_LIST.forEach( (friend:any) => {
        // get friend's socket room
        const friendSocketRoom = friend.userId;
      
        // notify only the active friends
        if (io.sockets.adapter.rooms.get(friendSocketRoom)) {
          // emit to friend that user is disconnected only if user has all sockets(connections) closed
          if (!io.sockets.adapter.rooms.has(USER_SOCKET_ROOM)) {
            socket.to(friendSocketRoom).emit("update_user_status", USER_SOCKET_ROOM, 'off');
          }
        }
      });
      // console.log('on_disconnection', io.sockets.adapter.rooms)
    }
  });
});

// Development purposes
app.get('/', (req, res) => {
  res.json({"message":"Friend Status Service"});
});

const PORT = process.env.FRIEND_STATUS_SERVICE_PORT || 8080;
server.listen(PORT, () => {
  console.log(`FRIEND STATUS server is running on PORT: ${PORT}`);
});

