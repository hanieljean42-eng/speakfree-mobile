import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DiscussionsService } from './discussions.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DiscussionsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private discussionsService: DiscussionsService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_discussion')
  async handleJoinDiscussion(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { discussionCode: string },
  ) {
    try {
      const discussion = await this.discussionsService.getDiscussion(
        data.discussionCode,
      );

      client.join(data.discussionCode);
      
      client.emit('joined_discussion', {
        discussionCode: data.discussionCode,
        status: discussion.status,
      });

      console.log(`Client ${client.id} joined discussion ${data.discussionCode}`);
    } catch (error) {
      client.emit('error', {
        message: 'Failed to join discussion',
        error: error.message,
      });
    }
  }

  @SubscribeMessage('leave_discussion')
  handleLeaveDiscussion(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { discussionCode: string },
  ) {
    client.leave(data.discussionCode);
    console.log(`Client ${client.id} left discussion ${data.discussionCode}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      discussionCode: string;
      content: string;
      sender: 'STUDENT' | 'SCHOOL';
      schoolId?: string;
    },
  ) {
    try {
      const message = await this.discussionsService.sendMessage(
        data.discussionCode,
        {
          content: data.content,
          sender: data.sender,
        },
        data.schoolId,
      );

      // Émettre le message à tous les clients dans la discussion
      this.server.to(data.discussionCode).emit('new_message', {
        id: message.id,
        sender: message.sender,
        content: message.content,
        createdAt: message.createdAt,
      });

      client.emit('message_sent', {
        success: true,
        messageId: message.id,
      });
    } catch (error) {
      client.emit('error', {
        message: 'Failed to send message',
        error: error.message,
      });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      discussionCode: string;
      sender: 'STUDENT' | 'SCHOOL';
    },
  ) {
    // Émettre à tous les autres clients dans la discussion
    client.to(data.discussionCode).emit('user_typing', {
      sender: data.sender,
    });
  }

  @SubscribeMessage('stop_typing')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      discussionCode: string;
      sender: 'STUDENT' | 'SCHOOL';
    },
  ) {
    client.to(data.discussionCode).emit('user_stopped_typing', {
      sender: data.sender,
    });
  }

  // Méthode pour émettre depuis les services
  emitToDiscussion(discussionCode: string, event: string, data: any) {
    this.server.to(discussionCode).emit(event, data);
  }

  emitStatusChange(discussionCode: string, newStatus: string) {
    this.server.to(discussionCode).emit('status_changed', {
      status: newStatus,
    });
  }
}
