-- CreateTable
CREATE TABLE "races" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nomFrancais" TEXT NOT NULL,
    "groupe" TEXT,
    "taille" TEXT,
    "description" TEXT,
    "typeOreilles" TEXT[],
    "typeQueue" TEXT[],
    "typePoil" TEXT[],
    "dogApiId" INTEGER,
    "enrichie" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "races_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "raceName" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "difficulte" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tentatives" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "raceSelectionnee" TEXT NOT NULL,
    "attributsSelectionnes" JSONB NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "abandonnee" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tentatives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "races_name_key" ON "races"("name");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_raceName_fkey" FOREIGN KEY ("raceName") REFERENCES "races"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tentatives" ADD CONSTRAINT "tentatives_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
