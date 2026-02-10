import { View, Text, Image } from 'react-native'
import React from 'react'
import { Slot, Redirect, Tabs } from 'expo-router'
import useAuthStore from '@/store/auth.store'
import { TabBarIconProps } from '@/type'
import { images } from '../../constants'
import cn from 'clsx'

const TabBarIcon = ({ focused, icon, title }: TabBarIconProps) => (
    <View className='tab-icon'>
        <Image source={icon} className='size-7' resizeMode='contain' tintColor={focused ? '#FE8V00' : '#5D5F6D'} />
        <Text className={cn('text-sm font-bold', focused ? 'text-primary' : 'text-gray-200')}>
            {title}
        </Text>
    </View>
)

const TabLayout = () => {
    // const isAuthenticated = true;
    const { isAuthenticated } = useAuthStore();
    console.log('Auth Status in Tab Layout:', isAuthenticated);
    if (!isAuthenticated) return <Redirect href="/sign-in" />

    return (
        <Tabs
            screenOptions={{ 
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    borderTopLeftRadius: 50,
                    borderTopRightRadius: 50,
                    borderBottomLeftRadius: 50,
                    borderBottomRightRadius: 50,
                    marginHorizontal: 20,
                    height: 80,
                    position: 'absolute',
                    bottom: 40,
                    backgroundColor: '#FFFFFF',
                    shadowColor: '#1a1a1a',
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 5,
                }
            }}
        >
            <Tabs.Screen 
                name="index" 
                options={{ 
                    title: 'Home', 
                    tabBarIcon: ({ focused }) => <TabBarIcon title="Home" icon={images.home} focused={focused} />,
                    headerShown: false,
                }} 
            />
            <Tabs.Screen 
                name="search" 
                options={{ 
                    title: 'Search', 
                    tabBarIcon: ({ focused }) => <TabBarIcon title="Search" icon={images.search} focused={focused} />,
                    headerShown: false,
                }} 
            />
            <Tabs.Screen 
                name="cart" 
                options={{ 
                    title: 'Cart', 
                    tabBarIcon: ({ focused }) => <TabBarIcon title="Cart" icon={images.bag} focused={focused} />,
                    headerShown: false,
                }} 
            />
            <Tabs.Screen 
                name="profile" 
                options={{ 
                    title: 'Profile', 
                    tabBarIcon: ({ focused }) => <TabBarIcon title="Profile" icon={images.user} focused={focused} />,
                    headerShown: false,
                }} 
            />
        </Tabs>
    )
}

export default TabLayout