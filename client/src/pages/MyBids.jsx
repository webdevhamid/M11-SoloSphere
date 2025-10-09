import axios from "axios";
import { useEffect, useState } from "react";
import BidTableRow from "../components/BidTableRow";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";

const MyBids = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [bids, setBids] = useState([]);

  useEffect(() => {
    fetchBids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const fetchBids = async () => {
    try {
      const response = await axiosSecure.get(`/my-bids/${user?.email}`);
      setBids(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  console.log(bids);

  const handleChangeStatus = async (id, prevStatus, newStatus) => {
    console.log({ id, prevStatus, newStatus });

    if (prevStatus !== "In progress") {
      return console.log("not allowed");
    }

    try {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_API_URL}/update-bid-request/${id}`,
        { newStatus }
      );
      console.log(data);
      toast.success(`Status changed to ${newStatus}`);
      fetchBids();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <section className="container px-4 mx-auto my-12">
      <div className="flex items-center gap-x-3">
        <h2 className="text-lg font-medium text-gray-800 ">My Bids</h2>

        <span className="px-3 py-1 font-bold text-xs text-blue-600 bg-blue-100 rounded-full ">
          {bids.length}
        </span>
      </div>

      <div className="flex flex-col mt-6">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden border border-gray-200  md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500"
                    >
                      <div className="flex items-center gap-x-3">
                        <span>Title</span>
                      </div>
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500"
                    >
                      <span>Deadline</span>
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500"
                    >
                      <button className="flex items-center gap-x-2">
                        <span>Price</span>
                      </button>
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500"
                    >
                      Category
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500"
                    >
                      Status
                    </th>

                    <th className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 ">
                  {bids.map((bid) => (
                    <BidTableRow key={bid._id} bid={bid} handleChangeStatus={handleChangeStatus} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyBids;
