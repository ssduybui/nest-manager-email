import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('emails')
export class EmailsEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true, nullable: true})
    brand_name: string;

    @Column({nullable: true})
    brand_domain: string;

    @Column({nullable: true})
    name_domain: string;

    @Column({nullable: true})
    html: string;

    @Column({nullable: true})
    is_verify: boolean;

    @Column({nullable: true})
    state: string;

    @Column({nullable: true})
    note: string;

    @Column({nullable: true})
    count_pending: number;

    @Column({nullable: true})
    employees: string;

    @Column({ type: 'timestamp', nullable: true })
    updated_at: string| Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: string| Date;
}