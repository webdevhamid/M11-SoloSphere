import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
const HomeTabs = () => {
  return (
    <div className="container mx-auto px-5 py-10">
      <h1 className="text-5xl text-center m-5 font-semibold">React Tabs</h1>
      <div className="flex items-center justify-center">
        <Tabs>
          <TabList>
            <Tab>Web Development</Tab>
            <Tab>Digital Marketing</Tab>
            <Tab>Graphics Design</Tab>
          </TabList>

          <TabPanel>
            <h2>Message from tab 1</h2>
          </TabPanel>
          <TabPanel>
            <h2>Message from tab 2</h2>
          </TabPanel>
          <TabPanel>
            <h2>Message from tab 3</h2>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default HomeTabs;
