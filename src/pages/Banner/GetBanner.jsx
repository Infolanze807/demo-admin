import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GetBanner() {
    const [bannerData, setBannerData] = useState([]);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null
    });
    const fetchBannerData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found. Please login again.');
            }

            const response = await axios.get('http://ec2-16-170-165-104.eu-north-1.compute.amazonaws.com:5000/api/admin/banner', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setBannerData(response.data.data.data);
            
        } catch (error) {
            console.error('Error fetching banner data:', error);
            setError('Error fetching banner data. Please try again.');
        }
    };

        useEffect(() => {
      
            fetchBannerData();
        }, []);

        const handleViewClick = (banner) => {
            setSelectedBanner(banner);
            setFormData({
                name: banner.name,
                description: banner.description,
                image: banner.image
            });
        };

        const handleCloseClick = () => {
            setSelectedBanner(null);
        };

        const handleDeleteClick = async (bannerId) => {

            if (window.confirm("Are you sure you want to delete?")) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found. Please login again.');
            }
            
            const base64EncodedIdObject = btoa(JSON.stringify({
                "iv": bannerId.iv,
                "encryptedData": bannerId.encryptedData
            }));
            
            const response = await axios.delete(`http://ec2-16-170-165-104.eu-north-1.compute.amazonaws.com:5000/api/admin/banner/${base64EncodedIdObject}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                fetchBannerData()
                window.alert("Company deleted successfully.");
            }
    
        } catch (error) {
            console.error('Error deleting company:', error);
            console.error('Error response from server:', error.response?.data); // Log the response data directly
        }
          console.log("Item deleted");  // This would be replaced with actual deletion logic
        } else {
          // If the user clicks "No", simply close the dialog
          console.log("Deletion cancelled");  // This line is optional, for debugging
        }
  
};
    

    const handleChange = (e) => {
        if (e.target.name === 'image') {
            setFormData({ ...formData, image: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found. Please login again.');
        }

        const base64EncodedIdObject = btoa(JSON.stringify({
            "iv": selectedBanner.id.iv,
            "encryptedData": selectedBanner.id.encryptedData
        }));

        const response = await axios.put(`http://ec2-16-170-165-104.eu-north-1.compute.amazonaws.com:5000/api/admin/banner/${base64EncodedIdObject}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        });

        
        if (response.status === 200) {
            window.alert("User Updated Successfully");
            fetchBannerData()  
            handleCloseClick()
         } setSelectedBanner(null); // Close the modal after updating

    } catch (error) {
        console.error('Error updating banner:', error);
        console.error('Error response from server:', error.response?.data); // Log the response data directly
    }
    };


    return (
        <div>
            {bannerData.map(banner => (
                <div key={banner.id.encryptedData} className="grid lg:grid-cols-6 grid-cols-1 items-center border rounded-lg p-5 bg-[--main-color] mb-5">
                    <div className='col-span-2'>
                        <img className='w-full object-cover rounded-lg' src={banner.image} alt="" />
                    </div>
                    <div className='col-span-3 text-gray-900 font-semibold text-sm leading-relaxed pt-5 lg:pt-0'>
                        <div>Name: &nbsp;<span className='font-normal'>{banner.name}</span></div>
                        <div>Description: &nbsp;<span className='font-normal'>{banner.description}</span></div>
                    </div>
                    <div className='lg:flex lg:flex-col mx-auto gap-2 pt-4 lg:pt-0'>
                        <button className="bg-green-500 px-8 w-max p-2 text-sm rounded-full text-white lg:me-5 lg:mb-0 mb-3" onClick={() => handleViewClick(banner)}>View</button>
                        <button className="bg-red-500 px-7 p-2 w-max text-sm rounded-full text-white" onClick={() => handleDeleteClick(banner.id)}>Delete</button>
                    </div>
                </div>
            ))}
            {selectedBanner && (
                <div className="fixed p-3 inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 overflow-y-auto">
                    <div className="bg-white w-[600px] max-w-2xl p-6 rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">Update Banner</h2>
                        <form className="max-w-xl mx-auto" onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Banner Name</label>
                                <input value={formData.name} onChange={handleChange} type="text" id="name" name="name" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Banner Name..." required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                                <textarea value={formData.description} onChange={handleChange} placeholder='Description...' type="text" id="description" name="description" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="image" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Image</label>
                                <input onChange={handleChange} type="file" id="image" name="image" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                            </div>
                            <div className="flex items-center justify-end space-x-4">
                                <button type="button" onClick={handleCloseClick} className="border border-gray-300 text-gray-900 dark:text-white rounded-lg px-6 py-2">Cancel</button>
                                <button type="submit" className="bg-blue-500 text-white rounded-lg px-6 py-2">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GetBanner;