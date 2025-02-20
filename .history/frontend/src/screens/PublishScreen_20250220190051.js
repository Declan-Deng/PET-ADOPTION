import React, { useState } from 'react';
import { Alert, AsyncStorage } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PublishScreen = () => {
  const navigation = useNavigation();
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [petName, setPetName] = useState('');
  const [type, setType] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [vaccinated, setVaccinated] = useState(false);
  const [sterilized, setSterilized] = useState(false);
  const [healthStatus, setHealthStatus] = useState('');

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // 先上传所有图片
      const uploadedImageUrls = await Promise.all(
        images.map(async (image) => {
          if (image.startsWith('http')) {
            return image; // 如果已经是网络URL，直接使用
          }
          
          const formData = new FormData();
          formData.append('image', {
            uri: image,
            type: 'image/jpeg',
            name: 'pet-image.jpg',
          });

          const token = await AsyncStorage.getItem('userToken');
          const response = await fetch('http://192.168.3.74:5001/api/upload/image', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error('图片上传失败');
          }

          const result = await response.json();
          return result.url;
        })
      );

      // 构建宠物数据
      const petData = {
        petName,
        type,
        breed,
        age: parseInt(age),
        gender,
        description,
        requirements,
        images: uploadedImageUrls,
        medical: {
          vaccinated,
          sterilized,
          healthStatus,
        },
      };

      // 发布宠物
      const response = await fetch('http://192.168.3.74:5001/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await AsyncStorage.getItem('userToken')}`,
        },
        body: JSON.stringify(petData),
      });

      if (!response.ok) {
        throw new Error('发布失败');
      }

      Alert.alert('成功', '发布成功', [
        {
          text: '确定',
          onPress: () => {
            navigation.navigate('Main', {
              screen: 'ProfileTab',
              params: {
                screen: 'MyPublications',
                params: { refresh: true },
              },
            });
          },
        },
      ]);
    } catch (error) {
      console.error('发布失败:', error);
      Alert.alert('错误', error.message || '发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Rest of the component code remains unchanged
  );
};

export default PublishScreen; 