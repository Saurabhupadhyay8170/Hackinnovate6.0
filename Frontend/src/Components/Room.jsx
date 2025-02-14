import React from 'react';
import { useParams } from 'react-router-dom';
import TextEditor from './TextEditor/TextEditor';

const Room = () => {
  // Get the room ID from URL parameters
  const { roomId } = useParams();

  return (
    <div className="room-container">
      <h2>Room: {roomId}</h2>
      <TextEditor roomId={roomId} />
    </div>
  );
};

export default Room;
