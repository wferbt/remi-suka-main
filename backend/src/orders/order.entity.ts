import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../auth/user.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  address: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ default: 'pending' }) // Статусы по ТЗ: pending, delivering, completed
  status: string;

  @Column('jsonb') // Здесь будем хранить массив товаров [{id, name, quantity, price}]
  items: any[];

  @ManyToOne(() => User)
  user: User;
}
