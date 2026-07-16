import { createFileRoute } from "@tanstack/react-router";
import { AddBookSheet } from "../components/AddBookSheet";

export const Route = createFileRoute("/add")({ component: AddBookSheet });
