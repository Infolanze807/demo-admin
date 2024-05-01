import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRegStar } from "react-icons/fa";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../Loader';

function AllEvent() {
  const [apiResponse, setApiResponse] = useState(null);
  const [eventData, setEventData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    content: '',
    published_date: '',
    image: null,
  });
  const [error, setError] = useState('');
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loading, setLoading] = useState(false);

  const URL = `${process.env.REACT_APP_API_URL}/api/admin/newsandevent?limit=5&page=1`

  const fetchEventData = async (url) => {
    try {
      setLoading(true);
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        throw new Error('No token found. Please login again.');
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${storedToken}`
        }
      });
      //const events = response.data.data.data.filter(item => item.type === 'Event');
      // events.sort((a, b) => b.isFeatured - a.isFeatured || new Date(b.published_date) - new Date(a.published_date));
      console.log(response.data.data,"apidetails")
      setApiResponse(response.data.data);
      setEventData(response.data.data.data);
    } catch (error) {
      console.error('Error fetching News and Event data:', error);
      setError('Error fetching News and Event data. Please try again.');
    } finally {
      setLoading(false); // Set loading back to false after fetching data
  }
  };
  const replaceLocalhost = (url) => {
    return url.replace("http://localhost:5000", `${process.env.REACT_APP_API_URL}`);
};
const replacePagehost = (url) => {
  return url.replace("http://localhost:5000/api/admin/news_and_event", `${process.env.REACT_APP_API_URL}/api/admin/newsandevent`);
};
  const handleNext = () => {
     if (apiResponse && apiResponse.next) {
      const nexturl = replacePagehost(apiResponse.next)
      console.log(nexturl,"next")
      fetchEventData(nexturl);
    }
};

const handlePrevious = () => {
    if (apiResponse && apiResponse.previous) {
     const previousurl =  replacePagehost(apiResponse.previous)
      console.log(apiResponse.previous,"previos")
      fetchEventData(previousurl);
    }
};

  useEffect(() => {
    fetchEventData(URL);
  }, []);

  const handleViewClick = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      type: event.type,
      content: event.content,
      published_date: event.published_date,
      image: null, // Assuming you don't want to change the image on update
    });
  };

  const handleCloseClick = () => {
    setSelectedEvent(null);
  };

  const handleDeleteClick = async (eventId) => {
    if (window.confirm("Are you sure you want to delete?")) {
      try {
        setDeleteLoadingId(eventId);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please login again.');
        }

        const base64EncodedIdObject = btoa(JSON.stringify({
          "iv": eventId.iv,
          "encryptedData": eventId.encryptedData
        }));

        const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/newsandevent/${base64EncodedIdObject}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.status === 200) {
          fetchEventData(URL);
          // window.alert("News and Event deleted successfully.");
          toast.success('News or Event deleted successfully.');
        }
      } catch (error) {
        console.error('Error deleting News and Event:', error);
        console.error('Error response from server:', error.response?.data); // Log the response data directly
    } finally {
      setDeleteLoadingId(null); // Set loading state to false after API call completes
  } 
      // console.log("Item deleted");  // This would be replaced with actual deletion logic
    } else {
      // If the user clicks "No", simply close the dialog
      console.log("Deletion cancelled");  // This line is optional, for debugging
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else if (e.target.name === 'isFeatured') {
      setFormData({ ...formData, isFeatured: e.target.checked });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoadingUpdate(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please login again.');
      }

      const base64EncodedIdObject = btoa(JSON.stringify({
        "iv": selectedEvent.id.iv,
        "encryptedData": selectedEvent.id.encryptedData
    }));

    const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/newsandevent/${base64EncodedIdObject}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
     Authorization: `Bearer ${token}`
 }
    });

        if (response.status === 200) {
          // window.alert("News and Event updated successfully.");
          toast.success('News or Event Updated Successfully');
          fetchEventData(URL);
          handleCloseClick();
        }setSelectedEvent(null)

    } catch (error) {
      console.error('Error updating component:', error);
      console.error('Error response from server:', error.response?.data);
    } finally {
      setLoadingUpdate(false);
  }
  };



  return (
    <div className='pb-7'>
    {loading && <Loader />}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-4">
        {eventData.map(event => (
          <div key={event.id.encryptedData} className="relative flex flex-col border border-blue-gray-50 shadow-md p-3 bg-clip-border rounded-xl bg-[--main-color] text-gray-700">
            <div className="relative bg-clip-border rounded-xl overflow-hidden bg-gray-900 text-white shadow-gray-900/20 shadow-lg mx-0 mt-0 mb-4 h-64 xl:h-40">
              <img src={replaceLocalhost(event.image)} alt={event.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-6 py-0 px-1">
            <div className='flex items-center justify-between'><h5 className="block antialiased tracking-normal font-sans text-xl font-semibold leading-snug text-blue-gray-900 mt-1 mb-2">{event.title}</h5><FaRegStar /></div>
              <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-500">{event.content}</p>
              <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-500">{event.type}</p>
            <div className='text-sm text-blue-gray-500 pt-2'>Date: {new Date(event.published_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })}</div>
            </div>
            <div className="p-6 mt-6 flex items-center justify-between py-0 px-1">
              <button className="bg-green-500 px-5 p-2 text-sm rounded-full text-white" onClick={() => handleViewClick(event)}>View</button>
              <button className="bg-red-500 px-5 p-2 text-sm rounded-full text-white" disabled={deleteLoadingId === event.id} onClick={() => handleDeleteClick(event.id)}>{deleteLoadingId === event.id ? 'Deleting...' : 'Delete'}</button>
            </div>
            
          </div>
        ))}
      </div>
      <div className='text-center pt-4'>
          <button onClick={handlePrevious} disabled={!apiResponse || !apiResponse.previous} className={`bg-[#2d2d2d] px-5 p-2 text-sm rounded-full text-white mx-2 w-24 ${!apiResponse || !apiResponse.previous ? 'opacity-50 cursor-not-allowed' : ''}`}>Previous</button>
          <button onClick={handleNext} disabled={!apiResponse || !apiResponse.next} className={`bg-[#2d2d2d] px-5 p-2 text-sm rounded-full text-white mx-2 w-24 ${!apiResponse || !apiResponse.next ? 'opacity-50 cursor-not-allowed' : ''}`}>Next</button>
      </div>
      {selectedEvent && (
        <div className="fixed p-3 inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="bg-white w-[600px] max-w-2xl p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Update News and Event</h2>
            <form className="max-w-xl mx-auto" onSubmit={handleSubmit}>
              <div className="mb-4">
              <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">News & Event Title</label>
                <input value={formData.title} onChange={handleChange} type="text" id="title" name="title" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="News and Event Title..." required />
              </div>
              <div className="mb-4">
              <label htmlFor="eventType" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">News & Event Type</label>
                {/* <input value={formData.title} onChange={handleChange} type="text" id="title" name="title" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="News and Event Title..." required /> */}
                <select id="eventType" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={formData.type} onChange={handleChange} required>
                  <option value="Event">Event</option>
                  <option value="News">News</option>
                 </select>
              </div>
              <div className="mb-4">
                <label htmlFor="content" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">News and Event Content</label>
                <textarea value={formData.content} onChange={handleChange} placeholder='News and Event Content...' type="text" id="content" name="content" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
              </div>
              <div className="mb-4">
                <label htmlFor="published_date" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Published Date</label>
                <input readOnly value={new Date(formData.published_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })} onChange={handleChange} type="text" id="published_date" name="published_date" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
              </div>
              <div className="mb-4">
                <label htmlFor="image" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">News and Event Image</label>
                <input onChange={handleChange} type="file" id="image" name="image" accept="image/*" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" />
              </div>
              <div className="flex items-center mb-5">
                <label htmlFor="isFeatured" className="text-sm font-medium text-gray-900 dark:text-gray-300">Show on top</label>
                <input  checked={formData.isFeatured} onChange={handleChange} name="isFeatured" id="isFeatured" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div className="flex items-center justify-end space-x-4">
                <button type="button" onClick={handleCloseClick} className="border border-gray-300 text-gray-900 dark:text-white rounded-lg px-6 py-2">Cancel</button>
                <button type="submit" className="bg-blue-500 text-white rounded-lg px-6 py-2" disabled={loadingUpdate}>{loadingUpdate ? 'Updating...' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}

export default AllEvent;
