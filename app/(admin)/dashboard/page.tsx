import Channels from "./channels/page";
import DashboardHome from "./home/page";
import Products from "./products/page";

const page = () => {
  return (
    <>
      <DashboardHome id="home" />
      <Channels />
      <Products />
    </>
  );
};

export default page;
