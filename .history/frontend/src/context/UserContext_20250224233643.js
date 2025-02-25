import * as React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENDPOINTS } from "../config";

export const UserContext = React.createContext();

// 示例宠物数据
const initialPetList = [
  {
    _id: "678aa596ea2a3e6d79c27a74",
    name: "奥利奥",
    type: "cat",
    breed: "英国短毛猫",
    age: "2岁",
    gender: "male",
    description:
      "这是一只非常可爱的小猫，黑白相间的毛色像奥利奥饼干。性格温顺，已经做过疫苗。喜欢和人互动，会使用猫砂盆。",
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80",
    ],
    requirements: "有独立住房，有养宠物经验，能提供稳定的生活环境",
    medical: {
      vaccinated: true,
      sterilized: true,
      healthStatus: "健康",
    },
    owner: {
      _id: "678aa596ea2a3e6d79c27a72",
      username: "test",
      profile: {
        name: "测试用户",
        phone: "13800138000",
        email: "test@example.com",
        address: "测试地址",
      },
    },
  },
  {
    _id: "678aa596ea2a3e6d79c27a75",
    name: "旺财",
    type: "dog",
    breed: "金毛寻回犬",
    age: "1岁",
    gender: "male",
    description:
      "旺财是一只活泼开朗的金毛，非常喜欢和人玩耍。已完成所有必要疫苗接种，性格友善，特别适合有小孩的家庭。",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80",
    ],
    requirements: "有大房子或庭院，家里人经常在家，能保证每天遛狗时间",
    medical: {
      vaccinated: true,
      sterilized: false,
      healthStatus: "健康",
    },
    owner: {
      _id: "678aa596ea2a3e6d79c27a72",
      username: "test",
      profile: {
        name: "测试用户",
        phone: "13800138000",
        email: "test@example.com",
        address: "测试地址",
      },
    },
  },
];

export const UserProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [petList, setPetList] = React.useState(initialPetList);

  // 检查是否已登录
  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("Checking authentication status...");
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem("userToken"),
        AsyncStorage.getItem("userData"),
      ]);

      if (token && userData) {
        console.log("Found stored user data:", userData);
        const parsedUserData = JSON.parse(userData);

        // 验证用户数据完整性
        const userId = parsedUserData.id || parsedUserData._id;
        if (!userId) {
          console.error("Stored user data is incomplete");
          await Promise.all([
            AsyncStorage.removeItem("userToken"),
            AsyncStorage.removeItem("userData"),
          ]);
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        // 确保数据结构的一致性
        const userDataWithProfile = {
          ...parsedUserData,
          id: userId, // 统一使用 id
          _id: userId, // 同时保留 _id 以兼容
          profile: {
            name:
              parsedUserData.profile?.name ||
              parsedUserData.username ||
              "未设置昵称",
            email: parsedUserData.profile?.email || parsedUserData.email || "",
            phone: parsedUserData.profile?.phone || parsedUserData.phone || "",
            address: parsedUserData.profile?.address || "",
          },
        };

        console.log("Restored user data:", userDataWithProfile);
        setUser(userDataWithProfile);
        setIsAuthenticated(true);
      } else {
        console.log("No stored user data found");
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      // 清除可能损坏的数据
      await Promise.all([
        AsyncStorage.removeItem("userToken"),
        AsyncStorage.removeItem("userData"),
      ]);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await fetch(ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("Received login data:", data);

      if (!response.ok) {
        throw new Error(data.message || "登录失败");
      }

      if (!data.token || !data.user) {
        throw new Error("登录失败：服务器返回数据不完整");
      }

      // 确保用户数据结构的一致性
      const userDataWithProfile = {
        ...data.user,
        profile: {
          name: data.user.profile?.name || data.user.username || "未设置昵称",
          email: data.user.profile?.email || data.user.email || "",
          phone: data.user.profile?.phone || data.user.phone || "",
          address: data.user.profile?.address || "",
          avatar: data.user.profile?.avatar || null,
        },
      };

      // 保存用户数据和令牌
      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify(userDataWithProfile)
      );

      // 更新状态
      setUser(userDataWithProfile);
      setIsAuthenticated(true);

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await fetch(ENDPOINTS.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "注册失败");
      }

      // 确保profile数据结构的一致性
      const userDataWithProfile = {
        ...data.user,
        profile: {
          name: data.user.profile?.name || data.user.username || "未设置昵称",
          email: data.user.profile?.email || data.user.email || "",
          phone: data.user.profile?.phone || data.user.phone || "",
          address: data.user.profile?.address || "",
          avatar: data.user.profile?.avatar || userData.avatar || null,
        },
      };

      // 保存用户数据到AsyncStorage
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify(userDataWithProfile)
      );
      await AsyncStorage.setItem("userToken", data.token);

      // 更新状态
      setUser(userDataWithProfile);
      setIsAuthenticated(true);

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedProfile) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(ENDPOINTS.PROFILE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProfile),
      });

      const responseData = await response.json();
      console.log("服务器响应数据:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "更新个人资料失败");
      }

      // 确保profile数据结构的一致性
      const userDataWithProfile = {
        ...user,
        profile: {
          ...user.profile,
          ...updatedProfile,
        },
      };
      console.log("最终更新的用户数据:", userDataWithProfile);

      // 更新本地存储
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify(userDataWithProfile)
      );

      // 更新状态
      setUser(userDataWithProfile);

      // 验证更新后的数据
      const verifyData = await AsyncStorage.getItem("userData");
      console.log("验证本地存储的数据:", JSON.parse(verifyData));

      return userDataWithProfile;
    } catch (error) {
      console.error("更新个人资料失败:", error);
      throw error;
    }
  };

  const uploadAvatar = async (imageUri) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const formData = new FormData();
      formData.append("avatar", {
        uri: imageUri,
        type: "image/jpeg",
        name: "avatar.jpg",
      });

      const response = await fetch(ENDPOINTS.UPLOAD_AVATAR, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadResult = await response.json();
      console.log("头像上传响应数据:", uploadResult);

      if (!response.ok) {
        throw new Error(uploadResult.message || "头像上传失败");
      }

      return uploadResult.url;
    } catch (error) {
      console.error("头像上传失败:", error);
      throw error;
    }
  };

  const addPublication = async (publication) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(ENDPOINTS.PETS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(publication),
      });

      console.log("发布响应状态:", response.status);
      const responseData = await response.json();
      console.log("发布响应数据:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "发布失败");
      }

      const { data: newPet } = responseData;

      // 更新本地状态
      const updatedUser = {
        ...user,
        publications: [...(user.publications || []), newPet._id],
      };

      console.log("更新后的用户数据:", updatedUser);

      // 保存到本地存储
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      setUser(updatedUser);

      return newPet;
    } catch (error) {
      console.error("Error adding publication:", error);
      throw error;
    }
  };

  const addAdoption = async (adoptionData) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(ENDPOINTS.ADOPTIONS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adoptionData),
      });

      if (!response.ok) {
        throw new Error("提交申请失败");
      }

      const submitResult = await response.json();
      console.log("申请提交结果:", submitResult);

      // 获取最新的申请记录列表
      const getResponse = await fetch(
        "http://192.168.3.74:5001/api/adoptions",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!getResponse.ok) {
        throw new Error("获取申请记录失败");
      }

      const { data: adoptions } = await getResponse.json();
      console.log("获取到的最新申请记录:", adoptions);

      // 更新用户的领养记录
      const updatedUser = {
        ...user,
        adoptions: adoptions || [],
      };

      // 保存到本地存储
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      setUser(updatedUser);

      return submitResult;
    } catch (error) {
      console.error("申请领养失败:", error);
      throw error;
    }
  };

  const cancelAdoption = async (adoptionId) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(ENDPOINTS.ADOPTION_DETAIL(adoptionId), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("取消申请响应:", data);

      if (!response.ok) {
        throw new Error(data.message || "取消申请失败");
      }

      // 获取最新的申请记录列表
      const getResponse = await fetch(
        "http://192.168.3.74:5001/api/adoptions",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!getResponse.ok) {
        throw new Error("获取申请记录失败");
      }

      const { data: adoptions } = await getResponse.json();
      console.log("获取到的最新申请记录:", adoptions);

      // 更新用户的领养记录
      const updatedUser = {
        ...user,
        adoptions: adoptions || [],
      };

      // 保存到本地存储
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      setUser(updatedUser);

      return data.data; // 返回更新后的申请记录
    } catch (error) {
      console.error("取消申请失败:", error);
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    petList,
    setPetList,
    addPublication,
    addAdoption,
    cancelAdoption,
    setUser,
  };

  if (loading) {
    // TODO: 返回加载界面
    return null;
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
