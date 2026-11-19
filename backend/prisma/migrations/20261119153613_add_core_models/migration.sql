-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'BUSINESS_ADMIN', 'AGENT', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "assignedAgentId" TEXT,
    "categoryId" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_events" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "businesses_slug_key" ON "businesses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_userId_businessId_key" ON "memberships"("userId", "businessId");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_tokenHash_key" ON "invitations"("tokenHash");

-- CreateIndex
CREATE INDEX "invitations_businessId_idx" ON "invitations"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_businessId_name_key" ON "categories"("businessId", "name");

-- CreateIndex
CREATE INDEX "tickets_businessId_status_idx" ON "tickets"("businessId", "status");

-- CreateIndex
CREATE INDEX "tickets_assignedAgentId_idx" ON "tickets"("assignedAgentId");

-- CreateIndex
CREATE INDEX "tickets_customerId_idx" ON "tickets"("customerId");

-- CreateIndex
CREATE INDEX "ticket_events_ticketId_createdAt_idx" ON "ticket_events"("ticketId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_ticketId_key" ON "ratings"("ticketId");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_events" ADD CONSTRAINT "ticket_events_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_events" ADD CONSTRAINT "ticket_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
