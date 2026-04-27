cmake_minimum_required(VERSION 3.16)
project(SocialNetworkAnalyzer CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Build the console app from a single file
add_executable(sna src/main.cpp)

# Compiler warnings
if(MSVC)
    target_compile_options(sna PRIVATE /W3)
else()
    target_compile_options(sna PRIVATE -Wall -Wextra -O2)
endif()
