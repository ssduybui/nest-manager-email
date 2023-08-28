import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('gmail_profile')
export class GmailProfileEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    email: string;

    @Column({unique: true})
    client_id: string;

    @Column({unique: true})
    client_secret: string;

    @Column({nullable: true})
    access_token: string;

    @Column({nullable: true})
    refresh_token: string;

    @Column({nullable: true})
    exprires_in: number;

    @Column({nullable: true})
    state: boolean;

    @Column({ type: 'timestamp', nullable: true })
    updated_at: string| Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: string| Date;
}