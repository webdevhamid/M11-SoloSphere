import { format } from "date-fns";

// eslint-disable-next-line react/prop-types
const BidTableRow = ({ bid, handleChangeStatus }) => {
  const { title, price, deadline, category, status, _id } = bid || {};
  return (
    <tr>
      <td className="px-4 py-4 text-sm text-gray-500  whitespace-nowrap">{title}</td>

      <td className="px-4 py-4 text-sm text-gray-500  whitespace-nowrap">
        {format(deadline, "dd/MM/yyyy")}
      </td>

      <td className="px-4 py-4 text-sm text-gray-500  whitespace-nowrap">${price}</td>
      <td className="px-4 py-4 text-sm whitespace-nowrap">
        <div className="flex items-center gap-x-2">
          <p className={`px-3 py-1  text-blue-500 bg-blue-100/60 text-xs  rounded-full`}>
            {category}
          </p>
        </div>
      </td>
      <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full gap-x-2 
          ${status === "In progress" && `bg-yellow-100/60 text-yellow-500`}
          ${status === "Completed" && `bg-green-100/60 text-green-500`} 
          ${status === "Pending" && `bg-gray-100/60 text-gray-500`} 
          ${status === "Rejected" && `bg-red-100/60 text-red-500`}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full 
            ${status === "Completed" && `bg-green-500`}
            ${status === "Rejected" && `bg-red-500`}
            ${status === "Pending" && `bg-gray-500`} 
            ${status === "In progress" && `bg-yellow-500`}`}
          ></span>
          <h2 className="text-sm font-normal ">{status}</h2>
        </div>
      </td>
      <td className="px-4 py-4 text-sm whitespace-nowrap">
        {/* Mark Complete button */}
        <button
          onClick={() => handleChangeStatus(_id, status, "Completed")}
          title="Mark Complete"
          disabled={status !== "In progress"}
          className="disabled:hover:cursor-not-allowed text-gray-500 transition-colors duration-200   hover:text-red-500 focus:outline-none disabled:cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
};

export default BidTableRow;
