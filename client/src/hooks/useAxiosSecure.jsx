import axios from "axios";
import useAuth from "./useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

// Custom axios secure hook
const useAxiosSecure = () => {
  const { logOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    //  Do something with axios response
    axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.status === 401 || error.status === 403) {
          // Logout the user
          logOut()
            .then(() => {
              console.log("User logged out successfully!");
            })
            .catch((err) => {
              console.log(err);
            });
          // Navigate the user to the login page
          navigate("/login");
          //  console axios error
          console.log("Error caught on axios interceptor--->", error);
        }
      }
    );
  }, [logOut, navigate]);

  // return
  return axiosInstance;
};

export default useAxiosSecure;
