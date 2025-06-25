import { User } from 'src/user/entities/user.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostRating } from './post-rating.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn({ name: 'post_id' })
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post, {
    onDelete: 'CASCADE',
  })
  comments: Comment[];

  @OneToMany(() => PostRating, (rating) => rating.post, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  ratings: PostRating[];
}
