import { Report } from '../reports/report.entity';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  BeforeRemove,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  email: string;

  @Column({ default: true })
  admin: boolean;

  @Column()
  password: string;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @AfterInsert()
  logInsert() {
    console.log(`Inserted user with id ${this.id}`);
  }

  @AfterUpdate()
  logUpdate() {
    console.log(`Updated user with id ${this.id}`);
  }

  //   @AfterRemove() This decorator will not log id as after removal id will not be present
  @BeforeRemove()
  logRemove() {
    console.log(`Removed user with id ${this.id}`);
  }
}
