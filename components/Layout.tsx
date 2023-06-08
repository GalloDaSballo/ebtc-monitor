import { Container } from "@mui/material";
import NavBar from "./NavBar";

export default function Layout({ children }) {
  return (
    <>
      <NavBar />
      <Container>{children}</Container>
    </>
  );
}
