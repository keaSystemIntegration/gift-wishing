import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
const server = http.createServer(app);

// app.use(express.static("public"));
app.use(cors());

dotenv.config();

interface IFriend {
  username: String,
  socketRoom: Number,
  status: String
};

interface IUserAndFriendsList {
  socketRoom: Number,
  friendsList: IFriend[]
};

interface ServerToClientEvents {
  friends_status: (friendsList: IFriend[]) => void,
  update_user_status: (USER_SOCKET_ROOM: String, status: String) => void
};

interface ClientToServerEvents {
  user_connected: (userAndFriendsList: IUserAndFriendsList) => void
};

import { Server } from "socket.io";
const io = new Server<ClientToServerEvents, ServerToClientEvents> (server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


function getFriendsStatusAndNotifyFriends(USER_SOCKET_ROOM: String, FRIENDS_LIST: IFriend[]) {
  FRIENDS_LIST.forEach(friend => {
    // get friend's socket room
    const friendSocketRoom = 'user__' + friend.socketRoom;

    // if the friend's room exists it means the friend is online
    const friendRoom = io.sockets.adapter.rooms.get(friendSocketRoom);
    if (friend.username == null) {
      friend.status = 'not registered';
    } else if (friendRoom) {
      // emit to friend that user is on
      io.to(friendSocketRoom).emit("update_user_status", USER_SOCKET_ROOM, 'on');

      // set friend status for the user
      friend.status = 'on';
    } else {
      friend.status = 'off';
    }
  });
  return FRIENDS_LIST;
}

io.on("connection", (socket) => {
  // console.log('\n\n=========NEW CONNECTION==========')
  let USER_SOCKET_ROOM = '';
  let FRIENDS_LIST: Array<IFriend> = [];

  socket.on("user_connected", (userAndFriendsList) => {
    USER_SOCKET_ROOM = 'user__' + userAndFriendsList.socketRoom;
    FRIENDS_LIST = userAndFriendsList.friendsList;

    //the user creates an unique room number based on UUID sent from database which
    // is joined by each separate connection of the same user
    socket.join(USER_SOCKET_ROOM)

    // get list of friends with statuses and notify active friends that the user is online
    const friendsList = getFriendsStatusAndNotifyFriends(USER_SOCKET_ROOM, FRIENDS_LIST);
    // emit to user the list of friends with statuses
    socket.emit("friends_status", friendsList);
  });

  socket.on("disconnect", () => {
    if (FRIENDS_LIST.length) {
      FRIENDS_LIST.forEach(friend => {
        // get friend's socket room
        const friendSocketRoom = 'user__' + friend.socketRoom;
      
        // notify only the active friends
        if (io.sockets.adapter.rooms.get(friendSocketRoom)) {
          // emit to friend that user is disconnected only if user has all sockets(connections) closed
          if (!io.sockets.adapter.rooms.has(USER_SOCKET_ROOM)) {
            io.to(friendSocketRoom).emit("update_user_status", USER_SOCKET_ROOM, 'off');
          }
        }
      });
      // console.log('on_disconnection', io.sockets.adapter.rooms)
    }
  });
})

app.get('/', (req, res) => {
  res.send("Friend Status Service");
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
})

