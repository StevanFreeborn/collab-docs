import 'dotenv/config';
import mongoose, { Schema, model } from 'mongoose';
import { Server } from 'socket.io';

mongoose.connect(process.env.MONGO_DB_CONN_STRING);

const documentSchema = new Schema(
  {
    _id: String,
    data: Object,
  },
  { timestamps: true }
);

const Documents = model('documents', documentSchema);

async function findOrCreateDocument({ id }) {
  const document = await Documents.findById(id);

  if (document !== null) {
    return document;
  }

  return await Documents.create({ _id: id, data: '' });
}

const io = new Server({
  cors: {
    origins: 'https://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', socket => {
  socket.on('get-document', async documentId => {
    const document = await findOrCreateDocument({ id: documentId });
    socket.join(documentId);
    socket.emit('load-document', document.data);

    socket.on('send-changes', async ({ delta, data }) => {
      await Documents.findByIdAndUpdate(documentId, { data });
      socket.broadcast.to(documentId).emit('changes-received', delta);
    });

    socket.on('save-document', async data => {
      await Documents.findByIdAndUpdate(documentId, { data });
    });
  });
});

io.listen(3000);
