package com.example.demo.Model;

import lombok.Data;


@Data


public class Response {
	private int id;
	private String response;
	public Response() {
		super();
		// TODO Auto-generated constructor stub
	}
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getResponse() {
		return response;
	}
	public void setResponse(String response) {
		this.response = response;
	}
	
}
