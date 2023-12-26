const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class InitialSchema1703583361550 {
    name = 'InitialSchema1703583361550'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "customs" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "price" integer NOT NULL, "category" character varying NOT NULL, "compounds" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1c16942b36aaad9612c85b98e98" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "passwordConfirm" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "active" boolean NOT NULL DEFAULT true, "activated" boolean NOT NULL DEFAULT false, "accountActivationToken" character varying, "accountActivationTokenExpires" TIMESTAMP, "passwordResetToken" character varying, "passwordResetExpires" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" SERIAL NOT NULL, "status" character varying NOT NULL DEFAULT 'new', "totalPrice" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "orders_customs_customs" ("ordersId" integer NOT NULL, "customsId" integer NOT NULL, CONSTRAINT "PK_f94fabc7aedb13beef0d5be170a" PRIMARY KEY ("ordersId", "customsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_37f131dd5c86d310f7c1b8238f" ON "orders_customs_customs" ("ordersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d68caba2c7e49fbea6e2192bdf" ON "orders_customs_customs" ("customsId") `);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders_customs_customs" ADD CONSTRAINT "FK_37f131dd5c86d310f7c1b8238f0" FOREIGN KEY ("ordersId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "orders_customs_customs" ADD CONSTRAINT "FK_d68caba2c7e49fbea6e2192bdf9" FOREIGN KEY ("customsId") REFERENCES "customs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders_customs_customs" DROP CONSTRAINT "FK_d68caba2c7e49fbea6e2192bdf9"`);
        await queryRunner.query(`ALTER TABLE "orders_customs_customs" DROP CONSTRAINT "FK_37f131dd5c86d310f7c1b8238f0"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d68caba2c7e49fbea6e2192bdf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_37f131dd5c86d310f7c1b8238f"`);
        await queryRunner.query(`DROP TABLE "orders_customs_customs"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "customs"`);
    }
}
