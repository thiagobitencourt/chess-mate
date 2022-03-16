import {
  AngularFireDatabase,
  AngularFireObject,
} from '@angular/fire/compat/database';
import { Observable, Subject, Subscription } from 'rxjs';
import { ChessBoardMovement } from '../model/movement';
import { OnlineMessage } from '../model/online-message';

export class ChessMatch {
  public code!: string;
  public owner!: boolean;

  private joined = false;
  private left = false;
  private justMoved = false;
  private match!: AngularFireObject<OnlineMessage>;
  private subscription = new Subscription();

  private readonly joinedSubject = new Subject<void>();
  private readonly leftSubject = new Subject<void>();
  private readonly moveSubject = new Subject<ChessBoardMovement>();

  constructor(database: AngularFireDatabase, matchCode?: string) {
    this.code = matchCode || this.getNewMatchCode();
    this.match = database.object<OnlineMessage>(`match/${this.code}`);
    this.owner = !matchCode;

    this.init();
    this.valueChanges();
  }

  move(movement: ChessBoardMovement): void {
    // Failed when stalemate movement property are undefined
    movement.stalemate = movement.stalemate || false;
    this.justMoved = true;
    this.match.update({ move: movement } as OnlineMessage);
  }

  leave(): void {
    if (!this.left) {
      this.left = true;
      this.match.update({ left: true } as OnlineMessage);
      this.closeMatch();
    }
  }

  onLeft(): Observable<void> {
    return this.leftSubject.asObservable();
  }

  onJoined(): Observable<void> {
    return this.joinedSubject.asObservable();
  }

  onMove(): Observable<ChessBoardMovement> {
    return this.moveSubject.asObservable();
  }

  private init(): void {
    if (this.owner) {
      this.match.set({ matchCode: this.code } as OnlineMessage);
    } else {
      this.joined = true;
      this.match.set({ joined: this.joined } as OnlineMessage);
    }
  }

  private valueChanges(): void {
    const matchSubs = this.match
      .valueChanges()
      .subscribe((message: OnlineMessage | null) => {
        if (!message) {
          return this.closeMatch();
        }

        const { joined, left, move } = message;
        if (this.owner && !this.joined && joined) {
          this.joined = true;
          return this.joinedSubject.next();
        }

        if (!this.left && left) {
          this.left = true;
          this.closeMatch();
          return this.leftSubject.next();
        }

        if (!this.justMoved && move) {
          this.moveSubject.next(move);
        }
        this.justMoved = false;
      });

    this.subscription.add(matchSubs);
  }

  private closeMatch(): void {
    this.subscription.unsubscribe();
  }

  private getNewMatchCode(): string {
    const length = 6;
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (var i = 0; i < length; i++) {
      result += randomChars.charAt(
        Math.floor(Math.random() * randomChars.length)
      );
    }
    return result;
  }
}
