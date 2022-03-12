import { MessageType } from './message-type';

export interface Message {
  frameId: string;
  type: MessageType;
  payload?: any;
}
