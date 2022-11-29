import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server, Socket } from "socket.io";

const app = express();
const server = http.createServer(app);

app.use(express.static("public"));
app.use(cors());

dotenv.config();

interface IFriend {
  username: string,
  userId: string,
  status: string
};

interface IUserAndFriendsList {
  userId: string,
  friendsList: IFriend[]
};

interface ServerToClientEvents {
  friends_status: (friendsList: IFriend[]) => void,
  update_user_status: (USER_SOCKET_ROOM: string, status: String) => void
};

interface ClientToServerEvents {
  user_connected: (userAndFriendsList: IUserAndFriendsList) => void
};

const io = new Server<ClientToServerEvents, ServerToClientEvents> (server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


function getFriendsStatusAndNotifyFriends(USER_SOCKET_ROOM: string, FRIENDS_LIST: IFriend[], socket: Socket) {
  if ( FRIENDS_LIST.length ) {
    FRIENDS_LIST.forEach(friend => {
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
  let USER_SOCKET_ROOM = '';
  let FRIENDS_LIST: Array<IFriend> = [];

  socket.on("user_connected", (userAndFriendsList: IUserAndFriendsList) => {
    USER_SOCKET_ROOM = userAndFriendsList.userId;
    FRIENDS_LIST = userAndFriendsList.friendsList;

    //the user creates an unique room number based on UUID sent from database which
    // is joined by each separate connection of the same user
    socket.join(USER_SOCKET_ROOM)
    // console.log('rooms', io.sockets.adapter.rooms)

    // get list of friends with statuses and notify active friends that the user is online
    const friendsList = getFriendsStatusAndNotifyFriends(USER_SOCKET_ROOM, FRIENDS_LIST, socket);
    // emit to user the list of friends with statuses
    socket.emit("friends_status", friendsList);
  });

  socket.on("disconnect", () => {
    if (FRIENDS_LIST.length) {
      FRIENDS_LIST.forEach(friend => {
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
})

// Development purposes
app.get('/', (req, res) => {
  res.json({"message":"Friend Status Service"});
});

const PORT = process.env.FRIEND_STATUS_SERVICE_PORT || 8080;
server.listen(PORT, () => {
  console.log(`FRIEND STATUS server is running on PORT: ${PORT}`);
})

