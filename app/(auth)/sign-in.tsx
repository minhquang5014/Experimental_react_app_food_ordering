import { View, Text, Button, Alert } from 'react-native'
import React from 'react'
import { router, Link } from 'expo-router'
import CustomInput from '@/components/CustomInput'
import CustomButton from '@/components/CustomButton'
import { SignInWithEmailPassword } from '@/lib/appwrite'
const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({ email: '', password: ''});

  const submit = async () => {
    if (!form.email || !form.password) return Alert.alert('Error', 'Please fill in all fields');
    setIsSubmitting(true);

    try {
      await SignInWithEmailPassword({ email: form.email, password: form.password });
      Alert.alert('Success', 'You have signed in successfully');
      router.replace('/');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput 
        placeholder='Enter your email'
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        label="Email"
        keyboardType="email-address"
      />
      <CustomInput 
        placeholder='Enter your password'
        value={form.password}
        onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
        label="Password"
        secureTextEntry={true}
      />
      <CustomButton title="Sign In" isLoading={isSubmitting} onPress={submit} />
      <View className="flex justify-center mt-5 flex-row gap-2">
        <Text className="base-regular text-gray-100">Don't have an account?</Text>
        <Link className="base-bold text-primary" href="/sign-up">Sign Up</Link>
      </View>
    </View>
  )
}

export default SignIn