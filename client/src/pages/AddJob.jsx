import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuth from "./../hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../hooks/useAxiosSecure";

const AddJob = () => {
  const [startDate, setStartDate] = useState(new Date());
  const { user } = useAuth();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (formData) => {
      // Add a new job (post request)
      await axiosSecure.post(`/add-job`, formData);
    },
    onSuccess: async () => {
      console.log("Job added successfully!");
      // Invalidating "jobs" query in order to refetching the new data from the server
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const jobTitle = form.job_title.value;
    const category = form.category.value;
    const minPrice = parseInt(form.min_price.value);
    const maxPrice = parseInt(form.max_price.value);
    const description = form.description.value;
    const deadline = startDate;
    const buyer = {
      email: user?.email,
      name: user?.displayName,
      photo: user?.photoURL,
    };
    const bidCount = 0;

    const formData = {
      jobTitle,
      buyer,
      deadline,
      category,
      minPrice,
      maxPrice,
      description,
      bidCount,
    };
    console.log(formData);

    try {
      // Add a new job (post request)
      await mutateAsync(formData);
      // Reset form data
      form.reset();
      // Show toast message
      toast.success("Job successfully added!");
      // Navigate to my-posted-job route
      navigate("/my-posted-jobs");
    } catch (err) {
      toast.error(err.message);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-306px)] my-12">
      <section className=" p-2 md:p-6 mx-auto bg-white rounded-md shadow-md ">
        <h2 className="text-lg font-semibold text-gray-700 capitalize ">Post a Job</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
            <div>
              <label className="text-gray-700 " htmlFor="job_title">
                Job Title
              </label>
              <input
                id="job_title"
                name="job_title"
                type="text"
                required
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md  focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring"
              />
            </div>

            <div>
              <label className="text-gray-700 " htmlFor="emailAddress">
                Email Address
              </label>
              <input
                id="emailAddress"
                type="email"
                name="email"
                disabled={true}
                defaultValue={user?.email}
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md  focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring"
              />
            </div>
            <div className="flex flex-col gap-2 ">
              <label className="text-gray-700">Deadline</label>

              {/* Date Picker Input Field */}
              <DatePicker
                className="border p-2 rounded-md"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
              />
            </div>

            <div className="flex flex-col gap-2 ">
              <label className="text-gray-700 " htmlFor="category">
                Category
              </label>
              <select name="category" id="category" className="border p-2 rounded-md">
                <option value="Web Development">Web Development</option>
                <option value="Graphics Design">Graphics Design</option>
                <option value="Digital Marketing">Digital Marketing</option>
              </select>
            </div>
            <div>
              <label className="text-gray-700 " htmlFor="min_price">
                Minimum Price
              </label>
              <input
                required
                id="min_price"
                name="min_price"
                type="number"
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md  focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring"
              />
            </div>

            <div>
              <label className="text-gray-700 " htmlFor="max_price">
                Maximum Price
              </label>
              <input
                required
                id="max_price"
                name="max_price"
                type="number"
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md  focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <label className="text-gray-700 " htmlFor="description">
              Description
            </label>
            <textarea
              className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md  focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring"
              name="description"
              id="description"
              required
            ></textarea>
          </div>
          <div className="flex justify-end mt-6">
            <button className="disabled:cursor-not-allowed px-8 py-2.5 leading-5 text-white transition-colors duration-300 transhtmlForm bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600">
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default AddJob;
