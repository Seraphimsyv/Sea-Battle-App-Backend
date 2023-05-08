import { 
  WebSocketGateway,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io-client';
import { JwtService } from '@nestjs/jwt';
import { WsChatService } from './ws-chat.service';
import { UsersService } from 'src/users/users.service';

type Client = {
  client: Socket,
  password: string
}

class ClientChatManager {
  public clients: Client[];

  constructor() {
    this.clients = [];
  }

  /**
   * 
   * @param client 
   * @param password 
   * @returns 
   */
  registerClient(client: Socket, password: string) : boolean {
    this.clients.forEach(element => {
      if (element.client === client) {
        return false;
      }
    });

    this.clients.push({ client: client, password: password });

    return true;
  }
  /**
   * 
   * @param client 
   * @returns 
   */
  checkRegisterClient(client: Socket) : boolean {
    this.clients.forEach(element => {
      if (element.client === client) {
        return true;
      }
    });

    return false;
  }
}

@WebSocketGateway(
  {
    path: "/api/ws/chat"
  }
)
export class WsChatGateway implements OnGatewayInit {  
  private readonly logger: Logger = new Logger('WsChatGateway');
  private readonly clientManager: ClientChatManager = new ClientChatManager();

  constructor(
    private readonly chatService: WsChatService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: any) {
    this.logger.log('WsChatGateway initialized');
  }

  handleConnection(client: Socket, payload: any) {
    this.logger.log('Client connected: ' + client.id);
  }

  handleDisconnect(client: any) {
    this.logger.log('Client disconnected: ' + client.id);
  }

  @SubscribeMessage('chatConnection')
  handleConnectToGame( client: Socket, payload: { gameToken: string} ) {
    this.logger.log('Client connected to chat: ' + client.id);
    this.clientManager.registerClient(client, payload.gameToken);
  }

  @SubscribeMessage('writeMessage')
  handleWriteMessage(
    @ConnectedSocket() client: Socket
  ) {
  }
  
  @SubscribeMessage('newMessage')
  handleNewMessage(client: Socket, payload: any) {
    console.log(client.id)
    console.log('Get message');
    console.log(payload);
  }
}