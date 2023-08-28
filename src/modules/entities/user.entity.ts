import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('accounts')
export class UserEntity {
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({ unique: true })
    user_name: string;

    @Column()
    user_password: string;

    @Column()
    user_fullname: string;

    @Column({ nullable: true })
    user_role: string;

    @Column({ default: "active" })
    user_state: string;

    @Column({ nullable: true })
    creater: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: string | Date;
}